// [B 담당] /scan — 판독 화면 (데모 컷2)
'use client';

import { useScanStore } from '@/stores/scanStore';
import ScanReport from '@/components/viewer/ScanReport';
import { SAMPLES, MOCK_PROFILE } from '@/lib/mock.scan';
import { USE_OCR } from '@/lib/config';
import { imagesToText } from '@/lib/ocr';
import { useRef, useState } from 'react';
import type { DocType } from '@/lib/types';

const DOC_TABS: { key: DocType; label: string }[] = [
  { key: 'lease', label: '전월세' },
  { key: 'labor', label: '근로계약' },
  { key: 'terms', label: '약관' },
  { key: 'message', label: '문자' },
];

export default function ScanPage() {
  const {
    text, docType, status, stage, srcText, result, error,
    setText, setDocType, applySample, start, reset,
  } = useScanStore();
  const running = status === 'triage' || status === 'full';
  const fileRef = useRef<HTMLInputElement>(null);
  const [ocrMsg, setOcrMsg] = useState<string | null>(null);

  async function handlePhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const extracted = await imagesToText(Array.from(files), setOcrMsg);
      setText(text ? text + '\n\n' + extracted : extracted);
      setOcrMsg(null);
    } catch {
      setOcrMsg('사진에서 글자를 읽지 못했어요. 더 밝고 정면에서 찍은 사진으로 다시 시도해주세요.');
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-9">
      <header className="mb-7">
        <h1 className="text-[30px] font-extrabold leading-tight text-[var(--ink)]">
          숨은 위험을 <span className="hl-brand">막아</span>드립니다
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--ink-soft)]">
          계약서를 붙여넣으면 조항별로 위험·주의·안전을 근거와 함께 보여드려요.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="h-fit rounded-2xl border border-[var(--line)] bg-white p-5 lg:sticky lg:top-6">
          <div className="mb-3 flex gap-1.5 rounded-xl bg-[var(--seg)] p-1">
            {DOC_TABS.map((t) => (
              <button key={t.key} onClick={() => setDocType(t.key)} disabled={running}
                className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-bold transition-colors ${
                  docType === t.key ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--ink-soft)]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={running}
            placeholder="계약서 내용을 여기에 붙여넣으세요" rows={13}
            className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--field)] p-4 text-[15.5px] leading-relaxed text-[var(--ink)] outline-none focus:border-[var(--ink)]" />

          <div className="mt-3 space-y-2">
            <button onClick={() => start(MOCK_PROFILE)} disabled={running || !text.trim()}
              className="w-full rounded-xl bg-[var(--ink)] px-5 py-3.5 text-[16px] font-extrabold text-white transition-transform active:scale-[0.98] disabled:opacity-40">
              {running ? '판독 중…' : '판독 시작'}
            </button>
            <div className="flex flex-wrap gap-2">
              {USE_OCR && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment"
                    multiple hidden onChange={(e) => { handlePhotos(e.target.files); e.target.value = ''; }} />
                  <button onClick={() => fileRef.current?.click()} disabled={running || !!ocrMsg}
                    className="flex-1 rounded-xl border-[1.5px] border-dashed border-[var(--ink)] px-3 py-3 text-[13px] font-bold text-[var(--ink)]">
                    📷 사진으로 넣기
                  </button>
                </>
              )}
              {SAMPLES[docType].map((s) => (
                <button key={s.name} onClick={() => applySample(s)} disabled={running}
                  className="flex-1 rounded-xl border-[1.5px] border-dashed border-[var(--line)] px-3 py-3 text-[13px] font-bold text-[var(--ink-soft)]">
                  {s.name}
                </button>
              ))}
              {(status === 'done' || status === 'error') && (
                <button onClick={reset}
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-[13px] font-bold text-[var(--ink-soft)]">
                  초기화
                </button>
              )}
            </div>
          </div>

          {ocrMsg && (
            <p className="mt-2 font-mono text-[12.5px] font-bold text-[var(--ink)]">{ocrMsg}</p>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
            입력한 문서는 개인정보 마스킹 후 분석되며 원문은 저장하지 않습니다.
            {USE_OCR && ' 사진은 브라우저 안에서만 글자로 변환되고 밖으로 전송되지 않아요.'}
          </p>
        </section>

        <section>
          <ScanReport status={status} stage={stage} srcText={srcText} result={result} error={error} />
        </section>
      </div>
    </main>
  );
}
