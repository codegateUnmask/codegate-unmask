'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import ContractInputScreen from '@/components/scan/ContractInputScreen';
import TextInputScreen from '@/components/scan/TextInputScreen';
import OcrProcessingScreen from '@/components/scan/OcrProcessingScreen';
import RecaptureScreen, { type RecaptureReason } from '@/components/scan/RecaptureScreen';
import OcrReviewScreen from '@/components/scan/OcrReviewScreen';
import AnalysisProgressScreen from '@/components/scan/AnalysisProgressScreen';
import AnalysisErrorScreen from '@/components/scan/AnalysisErrorScreen';
import AnalysisResultScreen from '@/components/scan/AnalysisResultScreen';
import ReportDetailScreen from '@/components/scan/ReportDetailScreen';
import RequestPhrasesScreen from '@/components/scan/RequestPhrasesScreen';
import { useAppStore } from '@/lib/store';
import { MAX_INPUT_CHARS } from '@/lib/config';
import { SAMPLES, type Sample } from '@/lib/mock.scan';
import { extractContractText } from '@/lib/ocr';
import type { ContractOcrAssessment } from '@/lib/ocr-confidence';
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
type Step =
  | 'input'
  | 'text-input'
  | 'ocr-processing'
  | 'recapture'
  | 'ocr-review'
  | 'progress'
  | 'error'
  | 'result'
  | 'report'
  | 'requests';

function mapOcrError(err: unknown): RecaptureReason {
  const message = err instanceof Error ? err.message : '';
  if (message.includes('모델')) return 'model-load-failed';
  if (message.includes('추출하지 못했')) return 'no-text';
  if (message.includes('손상') || message.includes('비어 있는') || message.includes('읽지 못했'))
    return 'corrupt';
  if (message.includes('JPG') || message.includes('형식') || message.includes('해상도가 너무 큽니다'))
    return 'unsupported';
  return 'no-text';
}

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
  const { text, docType, status, stage, srcText, result, setText, setDocType, applySample, start, reset } =
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
  const [fileName, setFileName] = useState('');
  const [ocrReview, setOcrReview] = useState<ContractOcrAssessment | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [recaptureReason, setRecaptureReason] = useState<RecaptureReason>('blur');
  const [errorKind, setErrorKind] = useState<'network' | 'server'>('server');
  const [lastInputStep, setLastInputStep] = useState<Extract<Step, 'text-input' | 'ocr-review' | 'input'>>('input');
  const [mismatch, setMismatch] = useState<{ label: string; type: DocType } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrAbortRef = useRef(false);

  const running = status === 'triage' || status === 'full';
  const requiresConfirmation = ocrReview !== null && !confirmed;

  useEffect(() => {
    // 팀 계약(CLAUDE.md §5): "프론트는 triage가 오면 즉시 렌더하고 full이 오면 갈아끼움".
    // 1차(triage) 결과는 실측 약 6.5초에 도착하는데 정밀 분석은 20~28초가 걸립니다.
    // 결과가 이미 손에 있는데 진행바만 보여주면 체감 대기가 4배로 늘어나므로,
    // 결과가 하나라도 들어오면 바로 결과 화면으로 넘기고 정밀 분석은 배너로 알립니다.
    if (running) setStep(result ? 'result' : 'progress');
    else if (status === 'done') setStep('result');
    else if (status === 'error') {
      setErrorKind(typeof navigator !== 'undefined' && !navigator.onLine ? 'network' : 'server');
      setStep('error');
    }
  }, [running, status, result]);

  function openPicker(kind: 'camera' | 'upload') {
    const input = fileInputRef.current;
    if (!input) return;
    if (kind === 'camera') input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    input.click();
  }

  async function runOcr(file: File) {
    setFileName(file.name);
    ocrAbortRef.current = false;
    setStep('ocr-processing');
    try {
      const extraction = await extractContractText(file);
      if (ocrAbortRef.current) return;
      if (extraction.decision === 'recapture') {
        setRecaptureReason(extraction.reasons.includes('blurry') ? 'blur' : 'low-resolution');
        setStep('recapture');
        return;
      }
      setText(extraction.assessment.text);
      setOcrReview(extraction.assessment);
      setConfirmed(false);
      setLastInputStep('ocr-review');
      setStep('ocr-review');
    } catch (err) {
      if (ocrAbortRef.current) return;
      setRecaptureReason(mapOcrError(err));
      setStep('recapture');
    }
  }

  function handleNextFromInput() {
    if (mode === 'text') {
      setLastInputStep('text-input');
      setStep('text-input');
      return;
    }
    openPicker(mode);
  }

  function handleSample(sample: Sample) {
    applySample(sample);
    setOcrReview(null);
    setConfirmed(false);
    setLastInputStep('input');
    void start(profile ?? undefined);
  }

  function handleAnalyzeFromText() {
    if (!text.trim()) return;
    setOcrReview(null);
    setConfirmed(false);
    const check = isMismatch(text, docType);
    if (check.mismatch && check.suggest && check.suggestLabel) {
      setMismatch({ label: check.suggestLabel, type: check.suggest });
      return; // 탭과 다른 문서로 보이면 판독을 시작하지 않고 안내
    }
    void start(profile ?? undefined);
  }

  function handleAnalyzeFromReview() {
    if (requiresConfirmation || !text.trim()) return;
    const check = isMismatch(text, docType);
    if (check.mismatch && check.suggest && check.suggestLabel) {
      setMismatch({ label: check.suggestLabel, type: check.suggest });
      return;
    }
    void start(profile ?? undefined);
  }

  function handleCancelAnalysis() {
    reset();
    setStep(lastInputStep);
  }

  function handleReset() {
    reset();
    setStep('input');
    setMode('text');
    setFileName('');
    setOcrReview(null);
    setConfirmed(false);
    setLastInputStep('input');
    setMismatch(null);
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void runOcr(file);
        }}
      />

      {step === 'input' && (
        <ContractInputScreen
          docType={docType}
          onDocTypeChange={setDocType}
          mode={mode}
          onModeChange={setMode}
          samples={SAMPLES[docType] ?? []}
          onSample={handleSample}
          busy={running}
          onNext={handleNextFromInput}
          profile={profile}
        />
      )}

      {step === 'text-input' && (
        <TextInputScreen
          docType={docType}
          text={text}
          maxChars={MAX_INPUT_CHARS}
          onDocTypeChange={setDocType}
          onTextChange={setText}
          onAnalyze={handleAnalyzeFromText}
          onBack={() => setStep('input')}
          disabled={running}
        />
      )}

      {step === 'ocr-processing' && (
        <OcrProcessingScreen
          fileName={fileName}
          stage="extract"
          onChangeImage={() => {
            ocrAbortRef.current = true;
            setStep('input');
            openPicker(mode === 'camera' ? 'camera' : 'upload');
          }}
          onCancel={() => {
            ocrAbortRef.current = true;
            setStep('input');
          }}
        />
      )}

      {step === 'recapture' && (
        <RecaptureScreen
          reason={recaptureReason}
          onRetake={() => openPicker('camera')}
          onPickAnother={() => openPicker('upload')}
          onTypeInstead={() => {
            setLastInputStep('text-input');
            setStep('text-input');
          }}
          onBack={() => setStep('input')}
        />
      )}

      {step === 'ocr-review' && (
        <OcrReviewScreen
          fileName={fileName || undefined}
          text={text}
          onTextChange={setText}
          assessment={ocrReview}
          confirmed={confirmed}
          onConfirmedChange={setConfirmed}
          requiresConfirmation={requiresConfirmation}
          onAnalyze={handleAnalyzeFromReview}
          analyzeDisabled={running || !text.trim() || requiresConfirmation}
          busy={running}
          onBack={() => setStep('input')}
          onRetake={() => openPicker('camera')}
        />
      )}

      {step === 'progress' && (
        <AnalysisProgressScreen
          docTypeLabel={DOC_LABELS[docType]}
          stage={stage}
          onCancel={handleCancelAnalysis}
          dangerCount={
            stage === 'triage' ? result?.findings.filter((f) => f.level === 'danger').length : undefined
          }
          warningCount={
            stage === 'triage' ? result?.findings.filter((f) => f.level === 'warning').length : undefined
          }
        />
      )}

      {step === 'error' && (
        <AnalysisErrorScreen
          kind={errorKind}
          onRetry={() => void start(profile ?? undefined)}
          onEdit={() => setStep(lastInputStep)}
          onBack={() => setStep(lastInputStep)}
        />
      )}

      {step === 'result' && result && (
        <AnalysisResultScreen
          result={result}
          docTypeLabel={DOC_LABELS[docType]}
          srcText={srcText}
          refining={running}
          onBack={handleReset}
          onShowDetail={() => setStep('report')}
          onShowRequests={() => setStep('requests')}
        />
      )}

      {step === 'report' && result && (
        <ReportDetailScreen
          result={result}
          docTypeLabel={DOC_LABELS[docType]}
          onBack={() => setStep('result')}
          onShowRequests={() => setStep('requests')}
        />
      )}

      {step === 'requests' && result && (
        <RequestPhrasesScreen
          phrases={(result.requestPhrases ?? []).map((phrase) => ({ text: phrase }))}
          onNewScan={handleReset}
          onBackToReport={() => setStep('report')}
        />
      )}

      <Dialog isOpen={mismatch !== null} onOpenChange={(open) => !open && setMismatch(null)} width={360}>
        {mismatch && (
          <div className="flex flex-col gap-1 px-1 pb-1">
            <h3 className="text-[16px] font-extrabold text-[var(--color-text-primary)]">
              이 문서는 「{mismatch.label}」 문서로 보여요
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              정확한 판독을 위해 {DOC_LABELS[mismatch.type]} 분석을 이용해주세요.
            </p>
            <div className="mt-3">
              <Button
                label={`${mismatch.label} 분석으로 이동`}
                variant="primary"
                width="100%"
                onClick={() => {
                  setDocType(mismatch.type);
                  setMismatch(null);
                }}
              />
            </div>
            <Button
              label="그래도 판독하기"
              variant="ghost"
              width="100%"
              onClick={() => {
                setMismatch(null);
                void start(profile ?? undefined);
              }}
            />
          </div>
        )}
      </Dialog>
    </>
  );
}
