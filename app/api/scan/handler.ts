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

        const triageResult = await engine
          .runTriage(text, parsed.docType, parsed.profile)
          .catch(() => null);
        if (triageResult) {
          controller.enqueue(encoder.encode(toSSE({ stage: 'triage', result: triageResult })));
        }

        try {
          const result = await engine.analyzeDocument(text, parsed.docType, parsed.profile);
          controller.enqueue(encoder.encode(toSSE({ stage: 'full', result })));
        } catch {
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
