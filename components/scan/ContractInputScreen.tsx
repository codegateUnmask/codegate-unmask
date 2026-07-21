'use client';

import Link from 'next/link';
import { ContractImageOcr } from './ContractImageOcr';
import { USE_OCR } from '@/lib/config';
import type { Sample } from '@/lib/mock.scan';
import type { ContractImageExtraction } from '@/lib/ocr';
import type { DocType, VulnProfile } from '@/lib/types';
import styles from './ContractInputScreen.module.css';

type InputMode = 'camera' | 'upload' | 'text';
type ReviewResult = Extract<ContractImageExtraction, { decision: 'review-required' }>;

const DOC_TABS: { key: DocType; label: string }[] = [
  { key: 'lease', label: '전월세' },
  { key: 'labor', label: '근로계약' },
  { key: 'service', label: '선불서비스' },
  { key: 'terms', label: '약관' },
  { key: 'message', label: '문자' },
];

const MODES: Array<{
  key: InputMode;
  title: string;
  description: string;
  icon: typeof CameraIcon;
}> = [
  {
    key: 'camera',
    title: '사진 촬영',
    description: '종이 계약서를 스마트폰 카메라로 바로 찍어서 분석합니다.',
    icon: CameraIcon,
  },
  {
    key: 'upload',
    title: '이미지 업로드',
    description: '갤러리에 저장된 계약서 캡처본이나 사진을 불러옵니다.',
    icon: ImageIcon,
  },
  {
    key: 'text',
    title: '텍스트 직접 입력',
    description: '확인이 필요한 특정 조항이나 텍스트를 직접 복사하여 붙여넣습니다.',
    icon: TextIcon,
  },
];

function SecurityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 2.18 7 3.11V11c0 4.52-2.98 8.69-7 9.93C7.98 19.69 5 15.52 5 11V6.29l7-3.11Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 17 4-4 3 3 3-3 6 5" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6h14M5 12h14M5 18h9" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm-1.1 15.2-4-4 1.4-1.4 2.6 2.6 5.8-5.8 1.4 1.4-7.2 7.2Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export interface ContractInputScreenProps {
  docType: DocType;
  onDocTypeChange: (docType: DocType) => void;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  text: string;
  onTextChange: (text: string) => void;
  samples: Sample[];
  onSample: (sample: Sample) => void;
  onOcrResult: (result: ReviewResult) => void;
  onOcrBusyChange: (busy: boolean) => void;
  busy: boolean;
  onNext: () => void;
  profile: VulnProfile | null;
}

export function ContractInputScreen({
  docType,
  onDocTypeChange,
  mode,
  onModeChange,
  text,
  onTextChange,
  samples,
  onSample,
  onOcrResult,
  onOcrBusyChange,
  busy,
  onNext,
  profile,
}: ContractInputScreenProps) {
  const canProceed = mode === 'text' && text.trim().length > 0 && !busy;

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.iconButton} aria-hidden="true">
          <SecurityIcon />
        </span>
        <h1 className={styles.logo}>unmask</h1>
        <span className={styles.iconButton} aria-hidden="true">
          <BellIcon />
        </span>
      </header>

      <section className={styles.content}>
        <div className={styles.heading}>
          <h1>
            어떤 계약서인지,
            <br />
            어떻게 분석할까요?
          </h1>
          <p>문서 종류와 입력 방법을 선택해 주세요.</p>
        </div>

        <fieldset className={styles.docTypeGroup}>
          <legend>문서 종류</legend>
          <div className={styles.docTypeTabs}>
            {DOC_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                disabled={busy}
                onClick={() => onDocTypeChange(tab.key)}
                className={docType === tab.key ? styles.docTypeTabActive : styles.docTypeTab}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.modeGroup}>
          <legend>계약서 입력 방법</legend>
          {MODES.map((item) => {
            const Icon = item.icon;
            const selected = mode === item.key;

            return (
              <label
                key={item.key}
                className={selected ? styles.modeCardSelected : styles.modeCard}
              >
                <input
                  type="radio"
                  name="input-mode"
                  value={item.key}
                  checked={selected}
                  disabled={busy}
                  onChange={() => onModeChange(item.key)}
                />
                <span className={styles.modeIcon}>
                  <Icon />
                </span>
                <span className={styles.modeCopy}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {mode === 'text' && (
          <div className={styles.textPanel}>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              disabled={busy}
              placeholder="계약서 내용을 여기에 붙여넣으세요"
              rows={10}
              className={styles.textarea}
            />
            {samples.length > 0 && (
              <div className={styles.sampleRow}>
                {samples.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    disabled={busy}
                    onClick={() => onSample(sample)}
                    className={styles.sampleButton}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {mode !== 'text' && USE_OCR && (
          <div className={styles.ocrPanel}>
            <ContractImageOcr
              disabled={busy}
              onBusyChange={onOcrBusyChange}
              onSelectionStart={() => {}}
              onResult={onOcrResult}
            />
          </div>
        )}
        {mode !== 'text' && !USE_OCR && (
          <p className={styles.ocrDisabledNotice}>
            이 환경에서는 사진 인식이 꺼져 있습니다. &quot;텍스트 직접 입력&quot;을 이용해 주세요.
          </p>
        )}

        <div className={styles.bottom}>
          <div className={styles.privacy}>
            <span className={styles.privacyIcon}>
              <VerifiedIcon />
            </span>
            <p>계약서 이미지는 서버에 저장되지 않고 브라우저 내에서 안전하게 처리됩니다.</p>
          </div>
          {profile ? (
            <p className={styles.personalizedNotice}>🎯 『{profile.typeName}』 맞춤 판독이 적용돼요</p>
          ) : (
            <Link href="/diagnose" className={styles.personalizedLink}>
              1분 진단하면 내 유형 맞춤 경고를 함께 받아요 →
            </Link>
          )}
          <button
            type="button"
            className={styles.cta}
            disabled={!canProceed}
            aria-disabled={!canProceed}
            onClick={onNext}
          >
            <span>다음 단계로</span>
            <ArrowIcon />
          </button>
        </div>
      </section>
    </main>
  );
}

export default ContractInputScreen;
