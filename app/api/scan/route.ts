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
        const triageResult = await runTriage(text, body.docType, body.profile).catch(() => null);
        if (triageResult) {
          controller.enqueue(encoder.encode(toSSE({ stage: 'triage', result: triageResult })));
        }

        const fullResult = await analyzeDocument(text, body.docType, body.profile);
        controller.enqueue(encoder.encode(toSSE({ stage: 'full', result: fullResult })));
      } catch {
        return;
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
