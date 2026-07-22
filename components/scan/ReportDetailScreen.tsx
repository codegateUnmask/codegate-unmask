import type { Finding, RiskLevel, ScanResult } from '@/lib/types';
import styles from './ReportDetailScreen.module.css';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';

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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.chevron}>
      <path d="m6 9 6 6 6-6" />
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

const OVERALL_TITLE: Record<RiskLevel, string> = {
  danger: '지금 상태로는 서명을 권하지 않아요.',
  warning: '몇 가지를 확인한 뒤에 서명하는 게 안전해요.',
  safe: '크게 불리한 조항은 보이지 않아요.',
};

const LEVEL_LABEL: Record<RiskLevel, string> = {
  danger: '위험',
  warning: '주의',
  safe: '안전',
};

const BADGE_CLASS: Record<RiskLevel, string> = {
  danger: styles.dangerBadge,
  warning: styles.warningBadge,
  safe: styles.safeBadge,
};

const COUNT_CLASS: Record<RiskLevel, string> = {
  danger: styles.dangerCount,
  warning: styles.warningCount,
  safe: styles.safeCount,
};

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <details className={styles.findingCard} open={finding.level === 'danger'}>
      <summary className={styles.findingSummary}>
        <span className={`${styles.badge} ${BADGE_CLASS[finding.level]}`}>
          {LEVEL_LABEL[finding.level]}
        </span>
        <span className={styles.findingTitle}>{finding.clauseTitle || '확인이 필요한 조항'}</span>
        <ChevronIcon />
      </summary>
      <div className={styles.findingBody}>
        <p className={styles.quoteLabel}>계약서 원문</p>
        <blockquote className={styles.quote}>&ldquo;{finding.quote}&rdquo;</blockquote>
        <p className={styles.reason}>{finding.reason}</p>
        {finding.detailedReason && <p className={styles.reason}>{finding.detailedReason}</p>}
        {finding.action && (
          <div className={styles.action}>
            <span>이렇게 요청해 보세요</span>
            <p>{finding.action}</p>
          </div>
        )}
        {finding.legalBasis && (
          <span className={styles.legalChip}>
            <BookIcon />
            {finding.legalBasis}
          </span>
        )}
      </div>
    </details>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <details className={styles.auxCard}>
      <summary className={styles.auxSummary}>
        <span>{title}</span>
        <span className={styles.auxCount}>{items.length}</span>
        <ChevronIcon />
      </summary>
      <ul className={styles.auxList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}

export interface ReportDetailScreenProps {
  result: ScanResult;
  docTypeLabel: string;
  onBack: () => void;
  onShowRequests: () => void;
}

export default function ReportDetailScreen({
  result,
  docTypeLabel,
  onBack,
  onShowRequests,
}: ReportDetailScreenProps) {
  const count = (level: RiskLevel) => result.findings.filter((f) => f.level === level).length;
  const levels: RiskLevel[] = ['danger', 'warning', 'safe'];

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.headerIcon} onClick={onBack} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <ClearGuardLogo size={26} />
        <span aria-hidden="true" />
      </header>

      <main className={styles.content}>
        <section className={styles.summaryCard} aria-labelledby="report-detail-title">
          <p className={styles.eyebrow}>{docTypeLabel} 상세 리포트</p>
          <h1 id="report-detail-title">{OVERALL_TITLE[result.overallLevel]}</h1>
          <p className={styles.summaryCopy}>{result.summary}</p>
          <dl className={styles.counts}>
            {levels.map((level) => (
              <div key={level} className={`${styles.count} ${COUNT_CLASS[level]}`}>
                <dt>{LEVEL_LABEL[level]}</dt>
                <dd>{count(level)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {result.findings.length > 0 && (
          <section className={styles.findings} aria-label="조항별 판독 결과">
            {result.findings.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </section>
        )}

        <section className={styles.aux} aria-label="추가 확인 사항">
          <ListSection title="추가로 필요한 서류" items={result.missingDocuments} />
          <ListSection title="이 문서만으로 확인 불가" items={result.unverifiable} />
          <ListSection title="공식 확인 기관" items={result.officialChannels} />
          <ListSection title="전문가 검토가 필요한 부분" items={result.needsExpertReview} />
        </section>

        {result.personalized && (
          <section className={styles.personalized} aria-label="내 취약 유형 맞춤 조언">
            <p className={styles.personalizedLabel}>내 취약 유형 맞춤 조언</p>
            <p className={styles.personalizedText}>{result.personalized}</p>
          </section>
        )}
      </main>

      <div className={styles.bottomDock}>
        <button type="button" className={styles.cta} onClick={onShowRequests}>
          계약 전에 물어볼 내용 보기
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}
