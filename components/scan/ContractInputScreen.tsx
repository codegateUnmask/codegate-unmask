'use client';

import Link from 'next/link';
import { USE_OCR } from '@/lib/config';
import type { Sample } from '@/lib/mock.scan';
import type { DocType, VulnProfile } from '@/lib/types';
import styles from './ContractInputScreen.module.css';

type InputMode = 'camera' | 'upload' | 'text';

const DOC_TABS: { key: DocType; label: string }[] = [
  { key: 'lease', label: '전월세' },
  { key: 'labor', label: '근로계약' },
  { key: 'service', label: '선불서비스' },
  { key: 'terms', label: '약관' },
  { key: 'message', label: '문자' },
];

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m11 6-6 6 6 6M5 12h14" />
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
  samples: Sample[];
  onSample: (sample: Sample) => void;
  busy: boolean;
  onNext: () => void;
  profile: VulnProfile | null;
  onBack?: () => void;
}

export function ContractInputScreen({
  docType,
  onDocTypeChange,
  mode,
  onModeChange,
  samples,
  onSample,
  busy,
  onNext,
  profile,
  onBack,
}: ContractInputScreenProps) {
  const canProceed = !busy && (mode === 'text' || USE_OCR);
  const ocrLocked = !USE_OCR;

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        {onBack ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onBack}
            aria-label="이전 화면으로"
          >
            <BackIcon />
          </button>
        ) : (
          <span className={styles.iconButton} aria-hidden="true" />
        )}
        <h1 className={styles.logo}>unmask</h1>
        <span className={styles.iconButton} aria-hidden="true" />
      </header>

      <section className={styles.content}>
        <div className={styles.heading}>
          <h1>
            서명 전에,
            <br />한 번 확인해요
          </h1>
          <p>문서를 고르고 편한 방법으로 가져오세요.</p>
        </div>

        <fieldset className={styles.section}>
          <legend className={styles.sectionLabel}>무엇을 확인하나요?</legend>
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

        <fieldset className={styles.section}>
          <legend className={styles.sectionLabel}>어떻게 가져올까요?</legend>

          <label
            className={mode === 'camera' ? styles.primaryModeSelected : styles.primaryMode}
          >
            <input
              type="radio"
              name="input-mode"
              value="camera"
              checked={mode === 'camera'}
              disabled={busy || ocrLocked}
              onChange={() => onModeChange('camera')}
            />
            <span className={styles.primaryIcon}>
              <CameraIcon />
            </span>
            <span className={styles.primaryCopy}>
              <strong>사진 촬영</strong>
              <span>종이 계약서를 바로 찍어요</span>
            </span>
          </label>

          <div className={styles.subModes}>
            <label className={mode === 'upload' ? styles.subModeSelected : styles.subMode}>
              <input
                type="radio"
                name="input-mode"
                value="upload"
                checked={mode === 'upload'}
                disabled={busy || ocrLocked}
                onChange={() => onModeChange('upload')}
              />
              <ImageIcon />
              <span>이미지 업로드</span>
            </label>
            <label className={mode === 'text' ? styles.subModeSelected : styles.subMode}>
              <input
                type="radio"
                name="input-mode"
                value="text"
                checked={mode === 'text'}
                disabled={busy}
                onChange={() => onModeChange('text')}
              />
              <TextIcon />
              <span>텍스트 직접 입력</span>
            </label>
          </div>

          {ocrLocked && (
            <p className={styles.ocrDisabledNotice}>
              이 환경에서는 사진 인식이 꺼져 있습니다. &quot;텍스트 직접 입력&quot;을 이용해
              주세요.
            </p>
          )}
        </fieldset>

        {samples.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>30초 체험</p>
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
          </div>
        )}

        <div className={styles.bottom}>
          <p className={styles.privacy}>
            <VerifiedIcon />
            <span>원문은 서버에 저장되지 않고 브라우저 안에서 처리돼요.</span>
          </p>
          {profile ? (
            <p className={styles.personalizedNotice}>
              『{profile.typeName}』 맞춤 판독이 적용돼요
            </p>
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
