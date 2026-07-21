// ============================================================
// 판독 화면 (데모 컷2) — [담당: 프론트(B)]
// 텍스트 붙여넣기 → SSE로 트리아지 → 정밀 결과를 받아 렌더링합니다.
// API 호출이 실패하면(예: 아직 ANTHROPIC_API_KEY 미설정) 목업으로 대체하고
// 명시적으로 "목업 데이터" 라벨을 붙입니다 (진짜인 척 두지 않는다 — 팀 CLAUDE.md §7③).
// ============================================================
'use client';

import { useState } from 'react';
import type { DocType, ScanResult, ScanStreamEvent } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { getKnowledgePack } from '@/lib/knowledge';
import { MOCK_SCAN_RESULT } from '@/lib/mock';
import { RISKY_LEASE_SAMPLE, SAFE_LEASE_SAMPLE } from '@/lib/samples/lease';
import { AnalysisChecklist } from '@/components/viewer/AnalysisChecklist';
import { ScanReport } from '@/components/viewer/ScanReport';

const DOC_TYPE_LABEL: Record<DocType, string> = {
  lease: '전월세 계약서',
  labor: '근로·알바 계약서',
  terms: '약관·독소조항',
  message: '문자 (스미싱/피싱)',
};

type Stage = 'idle' | 'triage' | 'full';

export default function ScanPage() {
  const profile = useAppStore((s) => s.profile);
  const [docType, setDocType] = useState<DocType>('lease');
  const [text, setText] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isMock, setIsMock] = useState(false);

  const pack = getKnowledgePack(docType);
  const loading = stage === 'triage';

  async function handleSubmit() {
    setStage('triage');
    setResult(null);
    setIsMock(false);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, docType, profile: profile ?? undefined }),
      });
      if (!res.body) throw new Error('no stream body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastStage: Stage = 'idle';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          if (!chunk.startsWith('data: ')) continue;
          const event = JSON.parse(chunk.slice(6)) as ScanStreamEvent;
          lastStage = event.stage;
          setStage(event.stage);
          setResult(event.result);
        }
      }

      // 서버가 에러를 삼키고 빈 스트림으로 닫는 경우가 있어(API 키 누락·호출 실패 등),
      // 이벤트가 하나도 안 온 상태로 스트림이 끝나면 실패로 처리한다.
      // 이 처리가 없으면 화면이 "검사 중"에서 영원히 멈춘다.
      if (lastStage === 'idle') throw new Error('스트림이 결과 없이 종료됨');
      // 트리아지까지만 오고 정밀 분석이 실패한 경우 — 있는 결과라도 완료로 마감한다.
      if (lastStage !== 'full') setStage('full');
    } catch (err) {
      console.error('[scan] falling back to mock:', err);
      setStage('full');
      setResult(MOCK_SCAN_RESULT);
      setIsMock(true);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold">계약서 판독</h1>

      <div className="flex gap-2">
        {(Object.keys(DOC_TYPE_LABEL) as DocType[]).map((dt) => (
          <button
            key={dt}
            type="button"
            onClick={() => setDocType(dt)}
            className={`rounded-full px-3 py-1 text-sm ${
              docType === dt
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {DOC_TYPE_LABEL[dt]}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="계약서 조항을 붙여넣으세요 (핵심 조항 위주로, 전문을 다 넣지 않아도 됩니다)"
        className="h-40 rounded-xl border border-neutral-300 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
      />

      {/* 데모용 샘플 불러오기 — 발표 때 붙여넣기 실수를 없애기 위한 버튼 */}
      {docType === 'lease' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">샘플:</span>
          <button
            type="button"
            onClick={() => setText(RISKY_LEASE_SAMPLE)}
            className="rounded-full border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            위험한 계약서
          </button>
          <button
            type="button"
            onClick={() => setText(SAFE_LEASE_SAMPLE)}
            className="rounded-full border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            안전한 계약서
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="self-start rounded-full bg-neutral-900 px-6 py-3 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
      >
        판독하기
      </button>

      {stage !== 'idle' && (
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="mb-3 text-sm font-medium text-neutral-500">
            {loading ? '검사 중입니다…' : '검사 완료'}
          </p>
          <AnalysisChecklist tasks={pack.tasks} stage={stage} />
        </div>
      )}

      {result && (
        <>
          {isMock && (
            <p className="rounded-lg bg-yellow-100 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              ⚠️ 목업 데이터입니다 (API 연결 전 화면 확인용)
            </p>
          )}
          <ScanReport result={result} />
        </>
      )}
    </main>
  );
}
