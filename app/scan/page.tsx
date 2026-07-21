'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function ScanPage() {
  const { text, docType, status, stage, result, setText, setDocType, applySample, start, reset } =
    useScanStore();
  const profile = useAppStore((state) => state.profile);

  const [step, setStep] = useState<Step>('input');
  const [mode, setMode] = useState<InputMode>('text');
  const [fileName, setFileName] = useState('');
  const [ocrReview, setOcrReview] = useState<ContractOcrAssessment | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [recaptureReason, setRecaptureReason] = useState<RecaptureReason>('blur');
  const [errorKind, setErrorKind] = useState<'network' | 'server'>('server');
  const [lastInputStep, setLastInputStep] = useState<Extract<Step, 'text-input' | 'ocr-review' | 'input'>>('input');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrAbortRef = useRef(false);

  const running = status === 'triage' || status === 'full';
  const requiresConfirmation = ocrReview !== null && !confirmed;

  useEffect(() => {
    if (running) setStep('progress');
    else if (status === 'done') setStep('result');
    else if (status === 'error') {
      setErrorKind(typeof navigator !== 'undefined' && !navigator.onLine ? 'network' : 'server');
      setStep('error');
    }
  }, [running, status]);

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
    void start(profile ?? undefined);
  }

  function handleAnalyzeFromReview() {
    if (requiresConfirmation || !text.trim()) return;
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
    </>
  );
}
