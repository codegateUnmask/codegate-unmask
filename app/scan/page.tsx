'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ContractInputScreen from '@/components/scan/ContractInputScreen';
import OcrReviewScreen from '@/components/scan/OcrReviewScreen';
import AnalysisProgressScreen from '@/components/scan/AnalysisProgressScreen';
import AnalysisResultScreen from '@/components/scan/AnalysisResultScreen';
import { useAppStore } from '@/lib/store';
import { SAMPLES, type Sample } from '@/lib/mock.scan';
import type { ContractOcrAssessment } from '@/lib/ocr-confidence';
import type { ContractImageExtraction } from '@/lib/ocr';
import type { DocType } from '@/lib/types';
import { useScanStore } from '@/stores/scanStore';
import { isMismatch } from '@/lib/docTypeGuess';

const DOC_LABELS: Record<DocType, string> = {
  lease: '전월세 계약서',
  labor: '근로계약서',
  service: '선불서비스 계약서',
  terms: '약관',
  message: '문자',
};

type InputMode = 'camera' | 'upload' | 'text';
type Step = 'input' | 'ocr-review' | 'progress' | 'result';
type ReviewResult = Extract<ContractImageExtraction, { decision: 'review-required' }>;

const VALID_DOC_TYPES: DocType[] = ['lease', 'labor', 'service', 'terms', 'message'];

export default function ScanPage() {
  // useSearchParams는 Suspense 경계가 필요합니다 (Next 15 정적 렌더링 요건).
  return (
    <Suspense fallback={null}>
      <ScanFlow />
    </Suspense>
  );
}

function ScanFlow() {
  const { text, docType, status, stage, result, error, setText, setDocType, applySample, start, reset } =
    useScanStore();
  const profile = useAppStore((state) => state.profile);
  const searchParams = useSearchParams();

  // 홈에서 목적별로 들어온 경우 해당 탭을 열어줍니다 (예: /scan?type=message).
  // 최초 1회만 반영 — 이후 사용자가 직접 바꾼 탭을 덮어쓰지 않도록.
  const presetApplied = useRef(false);
  useEffect(() => {
    if (presetApplied.current) return;
    presetApplied.current = true;
    const requested = searchParams.get('type');
    if (requested && VALID_DOC_TYPES.includes(requested as DocType)) {
      setDocType(requested as DocType);
    }
  }, [searchParams, setDocType]);

  const [step, setStep] = useState<Step>('input');
  const [mode, setMode] = useState<InputMode>('text');
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrReview, setOcrReview] = useState<ContractOcrAssessment | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [mismatch, setMismatch] = useState<{ label: string; type: DocType } | null>(null);

  const running = status === 'triage' || status === 'full';
  const requiresConfirmation = ocrReview !== null && !confirmed;

  // status가 done/error가 되면 결과 화면으로, 실행 중이면 진행 화면으로 자동 전환
  useEffect(() => {
    if (running) setStep('progress');
    else if (status === 'done' || status === 'error') setStep('result');
  }, [running, status]);

  function handleOcrResult(ocrResult: ReviewResult) {
    setText(ocrResult.assessment.text);
    setOcrReview(ocrResult.assessment);
    setConfirmed(false);
    setStep('ocr-review');
  }

  function handleSample(sample: Sample) {
    applySample(sample);
    setOcrReview(null);
    setConfirmed(false);
    start(profile ?? undefined);
  }

  function handleNextFromInput() {
    if (mode !== 'text' || !text.trim()) return;
    const check = isMismatch(text, docType);
    if (check.mismatch && check.suggest && check.suggestLabel) {
      setMismatch({ label: check.suggestLabel, type: check.suggest });
      return; // 탭과 다른 문서로 보이면 판독을 시작하지 않고 안내
    }
    start(profile ?? undefined);
  }

  function handleAnalyzeFromReview() {
    if (requiresConfirmation || !text.trim()) return;
    const check = isMismatch(text, docType);
    if (check.mismatch && check.suggest && check.suggestLabel) {
      setMismatch({ label: check.suggestLabel, type: check.suggest });
      return;
    }
    start(profile ?? undefined);
  }

  function handleReset() {
    reset();
    setStep('input');
    setMode('text');
    setOcrReview(null);
    setConfirmed(false);
    setRequestsOpen(false);
    setMismatch(null);
  }

  function handleBackToInput() {
    setStep('input');
    setOcrReview(null);
    setConfirmed(false);
  }

  if (step === 'ocr-review') {
    return (
      <>
      <OcrReviewScreen
        text={text}
        onTextChange={setText}
        assessment={ocrReview}
        confirmed={confirmed}
        onConfirmedChange={setConfirmed}
        requiresConfirmation={requiresConfirmation}
        onAnalyze={handleAnalyzeFromReview}
        analyzeDisabled={running || !text.trim() || requiresConfirmation}
        busy={running}
        onBack={handleBackToInput}
      />
      {mismatch && (
        <div
          role="dialog"
          aria-label="문서 유형 확인"
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-4 pb-6"
          onClick={() => setMismatch(null)}
        >
          <div
            className="w-full max-w-[480px] rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-extrabold text-[var(--ink)]">
              이 문서는 「{mismatch.label}」 문서로 보여요
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
              정확한 판독을 위해 {DOC_LABELS[mismatch.type]} 분석을 이용해주세요.
            </p>
            <button
              type="button"
              onClick={() => { setDocType(mismatch.type); setMismatch(null); }}
              className="mt-4 w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-[14px] font-bold text-white"
            >
              {mismatch.label} 분석으로 이동
            </button>
            <button
              type="button"
              onClick={() => { setMismatch(null); start(profile ?? undefined); }}
              className="mt-2 w-full py-1 text-center text-[12.5px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
            >
              그래도 판독하기
            </button>
          </div>
        </div>
      )}
      </>
    );
  }

  if (step === 'progress') {
    return <AnalysisProgressScreen docTypeLabel={DOC_LABELS[docType]} stage={stage} />;
  }

  if (step === 'result' && result) {
    return (
      <>
        <AnalysisResultScreen
          result={result}
          docTypeLabel={DOC_LABELS[docType]}
          onBack={handleReset}
          onShowRequests={() => setRequestsOpen(true)}
        />
        {requestsOpen && (result.requestPhrases?.length ?? 0) > 0 && (
          <div
            role="dialog"
            aria-label="상대에게 요청할 문구"
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-4 pb-6"
            onClick={() => setRequestsOpen(false)}
          >
            <div
              className="w-full max-w-[480px] rounded-2xl bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-[16px] font-extrabold text-[var(--ink)]">상대에게 요청할 문구</h3>
              <ul className="space-y-2">
                {result.requestPhrases.map((phrase, i) => (
                  <li key={i} className="rounded-xl bg-[var(--field)] px-3.5 py-3 text-[14.5px] leading-relaxed text-[var(--ink)]">
                    {phrase}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setRequestsOpen(false)}
                className="mt-4 w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-[14px] font-bold text-white"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (step === 'result' && status === 'error') {
    return (
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-[15px] font-bold text-[var(--danger)]">
          {error ?? '판독 중 문제가 생겼어요. 다시 시도해주세요.'}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl bg-[var(--ink)] px-5 py-3 text-[14px] font-bold text-white"
        >
          처음으로
        </button>
      </div>
    );
  }

  return (
    <>
      <ContractInputScreen
        docType={docType}
        onDocTypeChange={setDocType}
        mode={mode}
        onModeChange={setMode}
        text={text}
        onTextChange={setText}
        samples={SAMPLES[docType] ?? []}
        onSample={handleSample}
        onOcrResult={handleOcrResult}
        onOcrBusyChange={setOcrBusy}
        busy={running || ocrBusy}
        onNext={handleNextFromInput}
        profile={profile}
      />
      {mismatch && (
        <div
          role="dialog"
          aria-label="문서 유형 확인"
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-4 pb-6"
          onClick={() => setMismatch(null)}
        >
          <div
            className="w-full max-w-[480px] rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-extrabold text-[var(--ink)]">
              이 문서는 「{mismatch.label}」 문서로 보여요
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
              정확한 판독을 위해 {DOC_LABELS[mismatch.type]} 분석을 이용해주세요.
            </p>
            <button
              type="button"
              onClick={() => { setDocType(mismatch.type); setMismatch(null); }}
              className="mt-4 w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-[14px] font-bold text-white"
            >
              {mismatch.label} 분석으로 이동
            </button>
            <button
              type="button"
              onClick={() => { setMismatch(null); start(profile ?? undefined); }}
              className="mt-2 w-full py-1 text-center text-[12.5px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
            >
              그래도 판독하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
