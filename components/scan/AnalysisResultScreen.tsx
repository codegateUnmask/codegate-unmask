'use client';

import GlossaryText from '@/components/viewer/GlossaryText';
import { riskPercent, segmentDoc } from '@/lib/risk';
import type { Finding, RiskLevel, ScanResult } from '@/lib/types';
import styles from './AnalysisResultScreen.module.css';

/** mock.scan의 확장 필드 — 협상이 어려울 때의 차선책 */
type FindingWithCompromise = Finding & { compromise?: string };

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

const SUMMARY_STYLE: Record<RiskLevel, { bg: string; iconBg: string; eyebrow: string; title: string }> = {
  danger: { bg: 'var(--color-error-muted)', iconBg: 'var(--color-error)', eyebrow: '#8c1515', title: '#5f1111' },
  warning: { bg: '#ffe9d1', iconBg: 'var(--color-warning)', eyebrow: '#6b3800', title: '#4a2600' },
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

/** 원문 형광펜 색 (조항 카드의 MARK_CLASS와 별개 — 원문은 안전 구간도 칠함) */
const SRC_MARK: Record<RiskLevel, string> = {
  danger: styles.srcDanger,
  warning: styles.srcWarning,
  safe: styles.srcSafe,
};

export interface AnalysisResultScreenProps {
  result: ScanResult;
  docTypeLabel: string;
  /** 판독에 사용한 원문 — 형광펜 표시용 */
  srcText?: string;
  /** 1차(triage) 결과를 먼저 보여주는 중이고 정밀 분석이 아직 진행 중인지 */
  refining?: boolean;
  onBack: () => void;
  onShowRequests?: () => void;
  onShowDetail?: () => void;
}

export default function AnalysisResultScreen({
  result,
  docTypeLabel,
  srcText,
  refining,
  onBack,
  onShowRequests,
  onShowDetail,
}: AnalysisResultScreenProps) {
  const style = SUMMARY_STYLE[result.overallLevel];
  const explained = result.findings.filter(
    (f): f is typeof f & { level: 'danger' | 'warning' } => f.level !== 'safe',
  );
  const hasRequests = (result.requestPhrases?.length ?? 0) > 0;
  const showDetail = onShowDetail ?? (hasRequests ? onShowRequests : undefined);
  const counts = {
    danger: result.findings.filter((f) => f.level === 'danger').length,
    warning: result.findings.filter((f) => f.level === 'warning').length,
    safe: result.findings.filter((f) => f.level === 'safe').length,
  };
  const pct = riskPercent(result.overallLevel, result.findings);

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
        <span className={styles.headerIcon} aria-hidden="true" />
      </header>

      <main className={styles.content}>
        {refining && (
          <section className={styles.refining} role="status">
            <span className={styles.refiningDot} aria-hidden="true" />
            <p>
              <strong>1차 빠른 판독 결과</strong>입니다. 정밀 분석이 진행 중이며, 끝나면 더 자세한
              내용으로 자동 업데이트됩니다.
            </p>
          </section>
        )}

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

        {/* 위험도 게이지 — 등급만으로는 안 보이는 '얼마나'를 한 눈에 */}
        <section className={styles.gauge} aria-label="위험도">
          <div className={styles.gaugeHead}>
            <span className={styles.gaugeValue} style={{ color: style.iconBg }}>
              {pct}
              <span className={styles.gaugeUnit}>%</span>
            </span>
            <span className={styles.gaugeTrack}>
              <i style={{ width: `${pct}%`, background: style.iconBg }} />
            </span>
          </div>
          <p className={styles.gaugeCaption}>
            위험도 추정치 · 위험 {counts.danger} · 주의 {counts.warning} · 안전 {counts.safe}
          </p>
        </section>

        {/* 계약서 원문 — AI 형광펜. 어디가 문제인지 원문 위에서 바로 보여줍니다 */}
        {srcText && (
          <section className={styles.source} aria-label="원문 형광펜">
            <h2 className={styles.sectionTitle}>원문에서 짚은 부분</h2>
            <p className={styles.sourceBody}>
              {segmentDoc(srcText, result.findings).map((seg, i) =>
                seg.level ? (
                  <mark key={i} className={SRC_MARK[seg.level]}>
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
            <p className={styles.sourceLegend}>
              <b className={styles.legendDanger}>■ 위험</b> · <b className={styles.legendWarning}>■ 주의</b> ·{' '}
              <b className={styles.legendSafe}>■ 안전</b>
            </p>
          </section>
        )}

        {explained.length > 0 && (
          <section className={styles.findings} aria-label="발견된 독소조항">
            {explained.map((f) => {
              const level = f.level as 'danger' | 'warning';
              const compromise = (f as FindingWithCompromise).compromise;
              return (
                <article key={f.id} className={styles.findingCard}>
                  <header className={styles.findingHeader}>
                    <span className={`${styles.badge} ${BADGE_CLASS[level]}`}>{BADGE_LABEL[level]}</span>
                    <h2>{f.clauseTitle || '확인이 필요한 조항'}</h2>
                  </header>

                  {/* 어려운 용어에 점선 밑줄 — 누르면 쉬운 설명 (지식팩 glossary) */}
                  <blockquote className={styles.quote}>
                    &ldquo;
                    <mark className={MARK_CLASS[level]}>
                      <GlossaryText text={f.quote} />
                    </mark>
                    &rdquo;
                  </blockquote>

                  <div className={styles.explanation}>
                    <h3>왜 {BADGE_LABEL[level]}한가요?</h3>
                    <p>
                      <GlossaryText text={f.detailedReason || f.reason} />
                    </p>
                  </div>

                  {f.action && (
                    <div className={styles.suggestion}>
                      <span>지금 할 일</span>
                      <p>{f.action}</p>
                    </div>
                  )}

                  {compromise && (
                    <div className={styles.compromise}>
                      <span>협상이 어렵다면 (절충안)</span>
                      <p>{compromise}</p>
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

        {/* 법적 경계 고지 — 우리는 예/아니오를 선고하지 않는다는 원칙의 화면상 표현 */}
        <p className={styles.disclaimer}>
          이 판독은 법률 자문이 아닌 정보 제공입니다. 중요한 결정 전에는 전문가와 상의하세요.
          <br />
          무료 상담 · 대한법률구조공단 132 · 고용노동부 1350 · 주택임대차분쟁조정위원회
        </p>
      </main>

      <div className={styles.bottomDock}>
        {showDetail ? (
          <button type="button" className={styles.cta} onClick={showDetail}>
            계약 전에 물어볼 내용 보기
            <ArrowIcon />
          </button>
        ) : (
          <button type="button" className={styles.cta} onClick={onBack}>
            새 문서 판독하기
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  );
}
