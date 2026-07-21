'use client';

import { useRef, useState } from 'react';
import { extractContractText, type ContractImageExtraction } from '@/lib/ocr';

type OcrState = 'idle' | 'loading' | 'done' | 'recapture' | 'error';
type ReviewResult = Extract<ContractImageExtraction, { decision: 'review-required' }>;

interface ContractImageOcrProps {
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onSelectionStart: () => void;
  onResult: (result: ReviewResult) => void;
}

export function ContractImageOcr({
  disabled,
  onBusyChange,
  onSelectionStart,
  onResult,
}: ContractImageOcrProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<OcrState>('idle');
  const [message, setMessage] = useState('');

  function chooseImage() {
    if (!disabled && state !== 'loading') inputRef.current?.click();
  }

  async function handleImage(file: File) {
    setState('loading');
    setMessage('');
    onSelectionStart();
    onBusyChange(true);

    try {
      const result = await extractContractText(file);
      if (result.decision === 'recapture') {
        const reasons = [
          result.reasons.includes('too-small') ? '해상도가 낮습니다.' : '',
          result.reasons.includes('blurry') ? '사진이 흐립니다.' : '',
        ].filter(Boolean);
        setMessage(`${reasons.join(' ')} 더 밝고 정면에서 다시 촬영해 주세요.`);
        setState('recapture');
        return;
      }

      onResult(result);
      setState('done');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '이미지에서 텍스트를 추출하지 못했습니다.');
      setState('error');
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--field)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-extrabold text-[var(--ink)]">계약서 사진으로 입력</h2>
          <p className="mt-0.5 text-[12px] text-[var(--ink-soft)]">JPG·PNG 한 장을 브라우저에서 처리합니다.</p>
        </div>
        <button
          type="button"
          onClick={chooseImage}
          disabled={disabled || state === 'loading'}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-bold text-[var(--ink)] disabled:opacity-40"
        >
          {state === 'loading' ? '텍스트 추출 중…' : state === 'idle' ? '사진 촬영·업로드' : '다른 사진 선택'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void handleImage(file);
          }}
        />
      </div>

      {state === 'loading' && (
        <p role="status" className="mt-2 text-[12px] font-bold text-[var(--ink-soft)]">
          사진 품질을 확인한 뒤 한국어 OCR을 실행하고 있습니다.
        </p>
      )}
      {state === 'done' && (
        <p role="status" className="mt-2 text-[12px] font-bold text-[var(--ink)]">
          텍스트를 추출했습니다. 핵심 항목을 확인해 주세요.
        </p>
      )}
      {(state === 'recapture' || state === 'error') && (
        <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-bold text-[var(--danger)]">
          <span>{message}</span>
          <button type="button" onClick={chooseImage} className="underline underline-offset-2">
            재촬영·재업로드
          </button>
        </div>
      )}
    </section>
  );
}
