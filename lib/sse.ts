// ============================================================
// [B 담당] SSE 클라이언트 + 목업 스트림.
// A 계약: /api/scan 은 stage:'triage' → stage:'full' 두 이벤트를 순서로 보냄.
//   각 이벤트 = { stage, result: ScanResult }, 형식 data: {JSON}\n\n
// USE_MOCK_STREAM=true 면 A API 없이 목업 2단계를 시간차로 재생.
// ============================================================

import { USE_MOCK_STREAM } from './config';
import { SAMPLES, type Sample } from './mock.scan';
import type { ScanRequest, ScanResult, ScanStreamEvent } from './types';

export async function scanStream(
  req: ScanRequest,
  onEvent: (e: ScanStreamEvent) => void,
  signal?: AbortSignal,
  mockSample?: Sample,
): Promise<void> {
  if (USE_MOCK_STREAM) return mockStream(req, onEvent, signal, mockSample);

  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`판독 요청 실패 (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try { onEvent(JSON.parse(payload) as ScanStreamEvent); } catch { /* skip */ }
      }
    }
  }
}

async function mockStream(
  req: ScanRequest,
  onEvent: (e: ScanStreamEvent) => void,
  signal?: AbortSignal,
  mockSample?: Sample,
) {
  const s = mockSample ?? SAMPLES[req.docType]?.[0];
  if (!s) return;
  const meta = { docType: req.docType, scannedAt: new Date().toISOString() };
  const wait = (ms: number) =>
    new Promise<void>((r, j) => {
      const t = setTimeout(r, ms);
      signal?.addEventListener('abort', () => { clearTimeout(t); j(new DOMException('aborted', 'AbortError')); });
    });
  try {
    await wait(600);
    onEvent({ stage: 'triage', result: { ...s.triage, ...meta } as ScanResult });
    await wait(1400); // 정밀 분석 소요를 흉내
    onEvent({ stage: 'full', result: { ...s.full, ...meta } as ScanResult });
  } catch { /* aborted */ }
}
