'use client';

import { useMemo } from 'react';
import InputGuidance from './InputGuidance';
import { checkDocTypeMatch } from '@/lib/knowledge/router';
import type { DocType } from '@/lib/types';
import styles from './TextInputScreen.module.css';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';

const DOC_OPTIONS: { key: DocType; label: string }[] = [
  { key: 'lease', label: '전월세 계약서' },
  { key: 'labor', label: '근로·알바 계약서' },
  { key: 'service', label: '헬스장·피부과·학원 계약' },
  { key: 'terms', label: '온라인 약관·구독' },
  { key: 'message', label: '의심 문자' },
];

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 6-6 6 6 6M5 12h14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm-1.1 15.2-4-4 1.4-1.4 2.6 2.6 5.8-5.8 1.4 1.4-7.2 7.2Z" />
    </svg>
  );
}

export interface TextInputScreenProps {
  docType: DocType | null;
  text: string;
  maxChars?: number;
  onDocTypeChange: (docType: DocType) => void;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export function TextInputScreen({
  docType,
  text,
  maxChars = 12000,
  onDocTypeChange,
  onTextChange,
  onAnalyze,
  onBack,
  disabled = false,
}: TextInputScreenProps) {
  const match = useMemo(
    () => (docType ? checkDocTypeMatch(text, docType) : null),
    [text, docType],
  );
  // 뚜렷한 유형 불일치(협박문 포함)면 판독을 막고 전환을 안내합니다 —
  // 잘못된 카테고리의 판독 결과는 정확하지 않은데 정확해 보여서 더 해롭습니다.
  const blocked = match?.status === 'mismatch';
  const canAnalyze = !disabled && docType !== null && text.trim().length > 0 && !blocked;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onBack}
          aria-label="이전 화면으로"
        >
          <BackIcon />
        </button>
        <h1 className={styles.logo}><ClearGuardLogo size={26} asHomeLink /></h1>
        <span className={styles.iconButton} aria-hidden="true" />
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <h2>계약서 내용을 붙여넣어 주세요.</h2>
          <p>확인이 필요한 계약서나 약관 내용을 입력해 주세요.</p>
        </section>

        <fieldset className={styles.docTypeGroup} disabled={disabled}>
          <legend className={styles.docTypeLegend}>문서 유형</legend>
          <div className={styles.docTypeGrid} role="radiogroup" aria-label="문서 유형 선택">
            {DOC_OPTIONS.map((option) => {
              const selected = docType === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onDocTypeChange(option.key)}
                  className={selected ? styles.docChipSelected : styles.docChip}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.editorBlock}>
          <label className={styles.editorLabel} htmlFor="contract-text-input">
            계약서 내용
          </label>
          <textarea
            id="contract-text-input"
            className={styles.textarea}
            value={text}
            maxLength={maxChars}
            disabled={disabled}
            placeholder="계약서 내용을 여기에 붙여넣으세요."
            onChange={(e) => onTextChange(e.target.value)}
          />
          <p className={styles.charCount} aria-live="polite">
            {text.length.toLocaleString('ko-KR')} / {maxChars.toLocaleString('ko-KR')}자
          </p>
        </div>

        {match && <InputGuidance match={match} onSwitch={onDocTypeChange} />}

        <p className={styles.privacyNote}>
          <span className={styles.privacyIcon}>
            <ShieldIcon />
          </span>
          입력 내용은 개인정보 마스킹 후 분석되며 원문은 저장되지 않습니다.
        </p>
      </main>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.cta}
          disabled={!canAnalyze}
          onClick={onAnalyze}
        >
          {blocked && match?.suggested
            ? '위 안내에서 유형을 바꾸면 분석할 수 있어요'
            : '이 내용 분석하기'}
        </button>
      </footer>
    </div>
  );
}

export default TextInputScreen;
