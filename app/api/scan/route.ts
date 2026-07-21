// ============================================================
// POST /api/scan — [담당: 코어 오너(A)]
// 마스킹 → 트리아지(Haiku, 1차 SSE) → 정밀 분석(Opus, 2차 SSE) 순으로 스트리밍합니다.
// ============================================================

import type { NextRequest } from 'next/server';
import type { ScanRequest, ScanStreamEvent } from '@/lib/types';
import { maskPII } from '@/lib/engine/mask';
import { runTriage } from '@/lib/engine/triage';
import { analyzeDocument } from '@/lib/engine/analyze';
import { MAX_INPUT_CHARS } from '@/lib/config';

export const runtime = 'nodejs';

function toSSE(event: ScanStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ScanRequest;
  const text = maskPII(body.text.slice(0, MAX_INPUT_CHARS));

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const triageResult = await runTriage(text, body.docType, body.profile);
        controller.enqueue(encoder.encode(toSSE({ stage: 'triage', result: triageResult })));

        const fullResult = await analyzeDocument(text, body.docType, body.profile);
        controller.enqueue(encoder.encode(toSSE({ stage: 'full', result: fullResult })));
      } catch (err) {
        // TODO(A): 에러 이벤트를 프론트에 알릴 형식 정의 (지금은 로그만 남기고 스트림을 닫음)
        console.error('[api/scan] failed:', err);
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
    },
  });
}
