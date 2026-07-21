'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ScanReport from '@/components/viewer/ScanReport';
import { ContractImageOcr } from '@/components/scan/ContractImageOcr';
import { USE_OCR } from '@/lib/config';
import { SAMPLES, type Sample } from '@/lib/mock.scan';
import type { ContractOcrAssessment } from '@/lib/ocr-confidence';
import type { ContractImageExtraction } from '@/lib/ocr';
import { useAppStore } from '@/lib/store';
import type { DocType } from '@/lib/types';
import { useScanStore } from '@/stores/scanStore';

const DOC_TABS: { key: DocType; label: string }[] = [
  { key: 'lease', label: '전월세' },
  { key: 'labor', label: '근로계약' },
  { key: 'service', label: '선불서비스' },
  { key: 'terms', label: '약관' },
  { key: 'message', label: '문자' },
];

type ReviewResult = Extract<ContractImageExtraction, { decision: 'review-required' }>;

export default function ScanPage() {
  const {
    text,
    docType,
    status,
    stage,
    srcText,
    result,
    error,
    setText,
    setDocType,
    applySample,
    start,
    reset,
  } = useScanStore();
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrReview, setOcrReview] = useState<ContractOcrAssessment | null>(null);
  const [confirmedText, setConfirmedText] = useState<string | null>(null);
  const running = status === 'triage' || status === 'full';
  const busy = running || ocrBusy;
  const requiresConfirmation = ocrReview !== null && confirmedText !== text;
  const reviewLines = ocrReview?.lines.filter((line) => line.critical || line.lowConfidence) ?? [];
  const profile = useAppStore((state) => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleOcrResult(ocrResult: ReviewResult) {
    setText(ocrResult.assessment.text);
    setOcrReview(ocrResult.assessment);
    setConfirmedText(null);
  }

  function handleSample(sample: Sample) {
    applySample(sample);
    setOcrReview(null);
    setConfirmedText(null);
  }

  function handleStart() {
    if (busy || !text.trim() || requiresConfirmation) return;
    start(profile ?? undefined);
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
            {DOC_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDocType(tab.key)}
                disabled={busy}
                className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-bold transition-colors ${
                  docType === tab.key
                    ? 'bg-white text-[var(--ink)] shadow-sm'
                    : 'text-[var(--ink-soft)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={busy}
            placeholder="계약서 내용을 여기에 붙여넣으세요"
            rows={13}
            className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--field)] p-4 text-[15.5px] leading-relaxed text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />

          <div className="mt-3 space-y-3">
            {USE_OCR && (
              <ContractImageOcr
                disabled={running}
                onBusyChange={setOcrBusy}
                onSelectionStart={() => setConfirmedText(null)}
                onResult={handleOcrResult}
              />
            )}

            {ocrReview && (
              <fieldset className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-950">
                <legend className="px-1 font-extrabold">OCR 핵심 항목 확인</legend>
                <p className="mb-2 leading-relaxed">
                  추출된 텍스트와 아래 핵심 항목을 원문 사진과 대조해 주세요.
                </p>

                {reviewLines.length > 0 ? (
                  <ul className="mb-2 space-y-1.5">
                    {reviewLines.map((line, index) => (
                      <li key={`${line.text}-${index}`} className="rounded-lg bg-white px-2.5 py-2 leading-relaxed">
                        {line.critical && (
                          <span className="mr-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                            핵심 항목
                          </span>
                        )}
                        {line.lowConfidence && (
                          <span className="mr-2 rounded-full bg-amber-700 px-2 py-0.5 text-[11px] font-bold text-white">
                            인식 불확실
                          </span>
                        )}
                        {line.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-2 rounded-lg bg-white px-2.5 py-2 leading-relaxed">
                    핵심 또는 불확실 항목을 찾지 못했습니다. 누락되지 않았는지 전체 텍스트를 직접 확인해 주세요.
                  </p>
                )}

                <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-white px-2.5 py-2 font-bold leading-relaxed">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0"
                    checked={confirmedText === text}
                    onChange={(event) => setConfirmedText(event.target.checked ? text : null)}
                  />
                  금액, 날짜·기간, 위약금·환불, 자동갱신, 주민번호, 연락처, 계좌번호를 원문과 대조했습니다.
                </label>
                {requiresConfirmation && (
                  <p role="status" className="mt-2 font-bold">
                    핵심 항목 확인 후 판독을 시작할 수 있습니다.
                  </p>
                )}
              </fieldset>
            )}

            <button
              onClick={handleStart}
              disabled={busy || !text.trim() || requiresConfirmation}
              className="w-full rounded-xl bg-[var(--ink)] px-5 py-3.5 text-[16px] font-extrabold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              {running ? '판독 중…' : ocrBusy ? '사진 확인 중…' : '판독 시작'}
            </button>

            {mounted &&
              (profile ? (
                <p className="text-[12.5px] font-bold text-[var(--ink-soft)]">
                  🎯 『{profile.typeName}』 맞춤 판독이 적용돼요
                </p>
              ) : (
                <Link
                  href="/diagnose"
                  className="block text-[12.5px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
                >
                  1분 진단하면 내 유형 맞춤 경고를 함께 받아요 →
                </Link>
              ))}

            <div className="flex flex-wrap gap-2">
              {(SAMPLES[docType] ?? []).map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => handleSample(sample)}
                  disabled={busy}
                  className="flex-1 rounded-xl border-[1.5px] border-dashed border-[var(--line)] px-3 py-3 text-[13px] font-bold text-[var(--ink-soft)]"
                >
                  {sample.name}
                </button>
              ))}
              {(status === 'done' || status === 'error') && (
                <button
                  onClick={reset}
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-[13px] font-bold text-[var(--ink-soft)]"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

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
