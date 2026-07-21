import { MAX_INPUT_CHARS } from '../../../lib/config';
import { PROFILE_TYPES } from '../../../lib/diagnosis/profileTypes';
import { maskPII } from '../../../lib/engine/mask';
import { SCAN_ERROR_EVENT } from '../../../lib/sseProtocol';
import type {
  DocType,
  ScanRequest,
  ScanResult,
  ScanStreamEvent,
  VulnProfile,
} from '../../../lib/types';

const ANALYSIS_ERROR = {
  code: 'ANALYSIS_FAILED',
  message: '문서 분석에 실패했습니다.',
} as const;
const BAD_REQUEST_MESSAGE = '잘못된 요청입니다.';
// 허용 typeCode = 진단 16유형(PROFILE_TYPES) + 구버전 3유형(하위 호환).
// 서버가 가진 정의에서 도출 — 클라이언트 문자열을 신뢰하지 않는다.
const PROFILE_TYPE_CODES = new Set([
  ...Object.keys(PROFILE_TYPES),
  'AUTHORITY_DOMINANT',
  'URGENCY_DOMINANT',
  'GREED_DOMINANT',
]);
const DOC_TYPES = new Set<DocType>(['lease', 'labor', 'service', 'terms', 'message']);

type Analyzer = (
  text: string,
  docType: DocType,
  profile?: VulnProfile,
) => Promise<ScanResult>;

export type ScanEngine = {
  runTriage: Analyzer;
  analyzeDocument: Analyzer;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAxis(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function parseProfile(value: unknown): VulnProfile | undefined | null {
  if (value === undefined) return undefined;
  if (!isRecord(value) || !isRecord(value.axes) || typeof value.typeCode !== 'string') {
    return null;
  }
  if (!PROFILE_TYPE_CODES.has(value.typeCode)) return null;

  const { authority, urgency, greed, verify } = value.axes;
  if (!isAxis(authority) || !isAxis(urgency) || !isAxis(greed) || !isAxis(verify)) {
    return null;
  }

  return {
    typeCode: value.typeCode,
    typeName: '',
    tagline: '',
    axes: { authority, urgency, greed, verify },
    description: '',
    weakAgainst: [],
    createdAt: '',
  };
}

function badRequest(): Response {
  return Response.json({ error: BAD_REQUEST_MESSAGE }, { status: 400 });
}

async function parseRequest(request: Request): Promise<ScanRequest | Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return badRequest();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  if (
    !isRecord(body) ||
    typeof body.text !== 'string' ||
    typeof body.docType !== 'string' ||
    !DOC_TYPES.has(body.docType as DocType)
  ) {
    return badRequest();
  }
  if (body.text.trim().length === 0 || body.text.length > MAX_INPUT_CHARS) {
    return badRequest();
  }

  const profile = parseProfile(body.profile);
  if (profile === null) return badRequest();

  return {
    text: body.text,
    docType: body.docType as DocType,
    ...(profile === undefined ? {} : { profile }),
  };
}

/**
 * 판독 단계 실패를 서버 로그에만 남깁니다.
 *
 * 기존에는 `catch {}`로 통째로 버려서 프로덕션 장애의 원인을 볼 수 없었습니다
 * (실제로 정밀 분석 타임아웃을 추적하는 데 오래 걸렸습니다).
 * ⚠️ 응답 본문에는 그대로 두지 않습니다 — 원문·프로바이더 메시지가 새면 안 되므로
 *    에러 종류와 이름만 남기고 메시지 본문은 로그에도 넣지 않습니다.
 */
function logStageFailure(stage: 'triage' | 'full', error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error;
  const isTimeout =
    error instanceof Error && /timeout|aborted|ETIMEDOUT/i.test(`${error.name}${error.message}`);
  console.error(
    `[scan] ${stage} 단계 실패 — type=${name}${isTimeout ? ' (타임아웃 의심)' : ''}`,
  );
}

function toSSE(event: ScanStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function toErrorSSE(): string {
  return `event: ${SCAN_ERROR_EVENT}\ndata: ${JSON.stringify(ANALYSIS_ERROR)}\n\n`;
}

export function createScanHandler(engine: ScanEngine) {
  return async function handleScan(request: Request): Promise<Response> {
    const parsed = await parseRequest(request);
    if (parsed instanceof Response) return parsed;

    const text = maskPII(parsed.text);
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();

        // 두 단계는 같은 입력을 보는 독립 호출이라 동시에 띄웁니다.
        // 순차로 돌리면 (triage + 정밀)이 그대로 더해지지만, 병렬이면 둘 중 느린 쪽만 걸립니다.
        //   실측: triage 6.9초 + 정밀 15.4초 = 22.2초 → 병렬 15.4초 (6.9초 단축)
        // 다만 프론트가 triage를 먼저 렌더하고 정밀로 교체하는 계약이라
        // 전송 순서는 triage → full 로 유지합니다(수신 순서 보장).
        const triagePromise = engine
          .runTriage(text, parsed.docType, parsed.profile)
          .catch((error: unknown) => {
            logStageFailure('triage', error);
            return null;
          });
        const fullPromise = engine.analyzeDocument(text, parsed.docType, parsed.profile);
        // 아래에서 await 하기 전에 정밀 단계가 먼저 실패하면 unhandled rejection이 되므로 미리 붙여둡니다.
        fullPromise.catch(() => {});

        const triageResult = await triagePromise;
        if (triageResult) {
          controller.enqueue(encoder.encode(toSSE({ stage: 'triage', result: triageResult })));
        }

        try {
          const result = await fullPromise;
          controller.enqueue(encoder.encode(toSSE({ stage: 'full', result })));
        } catch (error: unknown) {
          logStageFailure('full', error);
          controller.enqueue(encoder.encode(toErrorSSE()));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  };
}
