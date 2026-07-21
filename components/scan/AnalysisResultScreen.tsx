import type { RiskLevel, ScanResult } from '@/lib/types';
import styles from './AnalysisResultScreen.module.css';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.75 27 7v7.7c0 6.65-4.52 12.24-11 14.55C9.52 26.94 5 21.35 5 14.7V7l11-4.25Z" />
      <rect x="11" y="14" width="10" height="8" rx="2" />
      <path d="M13.5 14v-1.5a2.5 2.5 0 0 1 5 0V14" />
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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
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

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </svg>
  );
}

const SUMMARY_STYLE: Record<RiskLevel, { bg: string; iconBg: string; eyebrow: string; title: string }> = {
  danger: { bg: '#ffdad6', iconBg: '#ba1a1a', eyebrow: '#8c1515', title: '#5f1111' },
  warning: { bg: '#ffe9d1', iconBg: '#8f4a00', eyebrow: '#6b3800', title: '#4a2600' },
  safe: { bg: '#e1f5d8', iconBg: '#2e6b1f', eyebrow: '#245416', title: '#1c400f' },
};

const OVERALL_TITLE: Record<RiskLevel, string> = {
  danger: '서명을 권하지 않아요',
  warning: '주의가 필요해요',
  safe: '비교적 안전해요',
};

const BADGE_CLASS: Record<'danger' | 'warning', string> = {
  danger: styles.dangerBadge,
  warning: styles.warningBadge,
};

const MARK_CLASS: Record<'danger' | 'warning', string> = {
  danger: styles.dangerMark,
  warning: styles.warningMark,
};

const BADGE_LABEL: Record<'danger' | 'warning', string> = {
  danger: '위험',
  warning: '주의',
};

export interface AnalysisResultScreenProps {
  result: ScanResult;
  docTypeLabel: string;
  onBack: () => void;
  onShowRequests?: () => void;
}

export default function AnalysisResultScreen({
  result,
  docTypeLabel,
  onBack,
  onShowRequests,
}: AnalysisResultScreenProps) {
  const style = SUMMARY_STYLE[result.overallLevel];
  const explained = result.findings.filter(
    (f): f is typeof f & { level: 'danger' | 'warning' } => f.level !== 'safe',
  );
  const hasRequests = (result.requestPhrases?.length ?? 0) > 0;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.headerIcon} onClick={onBack} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <span className={styles.brand}>
          <span className={styles.brandIcon}>
            <ShieldIcon />
          </span>
          <span>unmask</span>
        </span>
        <span className={styles.headerIcon} aria-hidden="true">
          <BellIcon />
        </span>
      </header>

      <main className={styles.content}>
        <section
          className={styles.summary}
          style={{ background: style.bg }}
          aria-labelledby="analysis-summary-title"
        >
          <span className={styles.summaryIcon} style={{ background: style.iconBg }}>
            {result.overallLevel === 'safe' ? <CheckCircleIcon /> : <AlertIcon />}
          </span>
          <div>
            <p className={styles.eyebrow} style={{ color: style.eyebrow }}>
              {docTypeLabel} 분석 결과
            </p>
            <h1 id="analysis-summary-title" style={{ color: style.title }}>
              {OVERALL_TITLE[result.overallLevel]}
            </h1>
            <p className={styles.summaryCopy} style={{ color: style.title }}>
              {result.summary}
            </p>
          </div>
        </section>

        {explained.length > 0 && (
          <section className={styles.findings} aria-label="발견된 독소조항">
            {explained.map((f) => {
              const level = f.level as 'danger' | 'warning';
              return (
                <article key={f.id} className={styles.findingCard}>
                  <header className={styles.findingHeader}>
                    <span className={`${styles.badge} ${BADGE_CLASS[level]}`}>{BADGE_LABEL[level]}</span>
                    <h2>{f.clauseTitle || '확인이 필요한 조항'}</h2>
                  </header>

                  <blockquote className={styles.quote}>
                    &ldquo;<mark className={MARK_CLASS[level]}>{f.quote}</mark>&rdquo;
                  </blockquote>

                  <div className={styles.explanation}>
                    <h3>왜 {BADGE_LABEL[level]}한가요?</h3>
                    <p>{f.detailedReason || f.reason}</p>
                  </div>

                  {f.action && (
                    <div className={styles.suggestion}>
                      <span>지금 할 일</span>
                      <p>{f.action}</p>
                    </div>
                  )}

                  {f.legalBasis && (
                    <span className={styles.sourceChip}>
                      <BookIcon />
                      {f.legalBasis}
                    </span>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {result.personalized && (
          <section className={styles.personalized} aria-label="내 취약 유형 맞춤 조언">
            <p className={styles.personalizedLabel}>내 취약 유형 맞춤 조언</p>
            <p className={styles.personalizedText}>{result.personalized}</p>
          </section>
        )}
      </main>

      <div className={styles.bottomDock}>
        {hasRequests ? (
          <button type="button" className={styles.cta} onClick={onShowRequests}>
            상대에게 요청할 문구 보기
            <ArrowIcon />
          </button>
        ) : (
          <button type="button" className={styles.cta} onClick={onBack}>
            새 문서 판독하기
            <ArrowIcon />
          </button>
        )}
        <nav className={styles.navigation} aria-label="주요 메뉴">
          <button type="button" className={`${styles.navItem} ${styles.navItemActive}`} onClick={onBack}>
            <HomeIcon />
            홈
          </button>
        </nav>
      </div>
    </div>
  );
}
