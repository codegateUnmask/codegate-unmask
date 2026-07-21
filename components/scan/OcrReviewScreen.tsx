'use client';

import type { ContractOcrAssessment } from '@/lib/ocr-confidence';
import styles from './OcrReviewScreen.module.css';

const ICON_PATHS = {
  security: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 2.18 7 3.11V11c0 4.52-2.98 8.69-7 9.93C7.98 19.69 5 15.52 5 11V6.29l7-3.11Z',
  check: 'M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9Z',
  scanner: 'M4 7V4h3V2H4a2 2 0 0 0-2 2v3h2Zm13-5v2h3v3h2V4a2 2 0 0 0-2-2h-3Zm3 15v3h-3v2h3a2 2 0 0 0 2-2v-3h-2ZM7 20H4v-3H2v3a2 2 0 0 0 2 2h3v-2Zm-1-5h12V9H6v6Zm2-4h8v2H8v-2Z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79Z',
  arrow: 'm12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z',
} as const;

function Icon({ name, size = 20 }: { name: keyof typeof ICON_PATHS; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const ARROW_LEFT = 'm11 6-6 6 6 6M5 12h14';

export interface OcrReviewScreenProps {
  fileName?: string;
  text: string;
  onTextChange: (text: string) => void;
  assessment: ContractOcrAssessment | null;
  confirmed: boolean;
  onConfirmedChange: (confirmed: boolean) => void;
  requiresConfirmation: boolean;
  onAnalyze: () => void;
  analyzeDisabled: boolean;
  busy: boolean;
  onBack: () => void;
  onRetake?: () => void;
}

export function OcrReviewScreen({
  fileName = '계약서 사진',
  text,
  onTextChange,
  assessment,
  confirmed,
  onConfirmedChange,
  requiresConfirmation,
  onAnalyze,
  analyzeDisabled,
  busy,
  onBack,
  onRetake,
}: OcrReviewScreenProps) {
  const reviewLines = assessment?.lines.filter((line) => line.critical || line.lowConfidence) ?? [];

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.iconButton} type="button" onClick={onBack} aria-label="이전 화면으로">
          <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d={ARROW_LEFT} />
          </svg>
        </button>
        <h1 className={styles.logo}>unmask</h1>
        <span className={styles.iconButton} aria-hidden="true" />
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="ocr-review-title">
          <div className={styles.stepChip}>
            <Icon name="check" size={18} />
            <span>1단계: 텍스트 추출 완료</span>
          </div>
          <h2 id="ocr-review-title">추출된 내용을 확인해 주세요.</h2>
          <p>오타가 있거나 인식이 잘못된 부분이 있다면 수정할 수 있습니다. 아래 핵심 항목은 원문 사진과 꼭 대조해 주세요.</p>
        </section>

        <section className={styles.documentCard} aria-label="추출된 계약서 내용">
          <div className={styles.documentHeader}>
            <div className={styles.fileName}>
              <Icon name="scanner" size={18} />
              <span>{fileName}</span>
            </div>
            <span className={styles.editHint}>
              <Icon name="edit" size={14} />
              직접 수정 가능
            </span>
          </div>
          <div className={styles.documentText}>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              disabled={busy}
              rows={14}
              aria-label="추출된 계약서 텍스트 (수정 가능)"
              className={styles.editableText}
            />
          </div>

          {assessment && (
            <div className={styles.reviewPanel}>
              <p className={styles.reviewTitle}>
                <Icon name="edit" size={16} />
                핵심 항목 확인
              </p>
              {reviewLines.length > 0 ? (
                <ul className={styles.reviewList}>
                  {reviewLines.map((line, index) => (
                    <li key={`${line.text}-${index}`} className={styles.reviewItem}>
                      {line.critical && <span className={styles.criticalBadge}>핵심 항목</span>}
                      {line.lowConfidence && <span className={styles.lowConfidenceBadge}>인식 불확실</span>}
                      {line.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.reviewEmpty}>
                  핵심 또는 불확실 항목을 찾지 못했습니다. 누락되지 않았는지 전체 텍스트를 직접 확인해 주세요.
                </p>
              )}
              <label className={styles.confirmRow}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => onConfirmedChange(e.target.checked)}
                />
                금액, 날짜, 위약금 등 핵심 항목을 원본 사진과 대조했습니다.
              </label>
              {requiresConfirmation && (
                <p role="status" className={styles.confirmNotice}>
                  핵심 항목 확인 후 분석을 시작할 수 있습니다.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.actions}>
        <button
          className={styles.primaryAction}
          type="button"
          disabled={analyzeDisabled}
          onClick={onAnalyze}
        >
          <span>{busy ? '분석 중…' : '수정한 내용으로 분석하기'}</span>
          <Icon name="arrow" size={20} />
        </button>
        {onRetake && (
          <button
            className={styles.secondaryAction}
            type="button"
            disabled={busy}
            onClick={onRetake}
          >
            재촬영하기
          </button>
        )}
      </footer>
    </div>
  );
}

export default OcrReviewScreen;
