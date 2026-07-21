import type { AnalysisStage } from '@/lib/types';
import styles from './AnalysisProgressScreen.module.css';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20 5.6v5.6c0 4.84-3.29 8.91-8 10.6-4.71-1.69-8-5.76-8-10.6V5.6L12 2.5Z" />
      <path d="m8.7 12 2.1 2.1 4.7-4.7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 10.2 3.2 3.2L15 6.8" />
    </svg>
  );
}

function DocumentThumbnail() {
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      <span className={styles.fold} />
      <span className={styles.documentLine} />
      <span className={styles.documentLine} />
      <span className={styles.documentLineShort} />
    </span>
  );
}

export interface AnalysisProgressScreenProps {
  docTypeLabel: string;
  stage: AnalysisStage | null;
  onCancel?: () => void;
  triageSummary?: string;
  dangerCount?: number;
  warningCount?: number;
}

const STEP_LABELS = ['개인정보 마스킹 완료', '빠른 위험 분류', '정밀 계약 판독', '원문 근거 검증'] as const;

export default function AnalysisProgressScreen({
  docTypeLabel,
  stage,
  onCancel,
  triageSummary,
  dangerCount,
  warningCount,
}: AnalysisProgressScreenProps) {
  const activeIndex = stage === 'full' ? 3 : stage === 'triage' ? 2 : 1;
  const statusText =
    stage === 'full'
      ? '원문 근거를 검증하고 있습니다.'
      : stage === 'triage'
        ? '정밀 계약 판독을 진행하고 있습니다.'
        : '빠른 위험 분류를 진행하고 있습니다.';

  const countParts: string[] = [];
  if (dangerCount) countParts.push(`위험 ${dangerCount}건`);
  if (warningCount) countParts.push(`주의 ${warningCount}건`);
  const summaryLine =
    triageSummary ?? (countParts.length > 0 ? `${countParts.join('과 ')}을 먼저 발견했어요.` : null);

  return (
    <section className={styles.screen} aria-labelledby="analysis-progress-title">
      <header className={styles.header}>
        <span />
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <ShieldIcon />
          </span>
          <span>ClearGuard</span>
        </div>
        {onCancel ? (
          <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="분석 취소">
            <CloseIcon />
          </button>
        ) : (
          <span />
        )}
      </header>

      <div className={styles.content}>
        <div>
          <article className={styles.documentCard}>
            <DocumentThumbnail />
            <div className={styles.documentCopy}>
              <span className={styles.badge}>{docTypeLabel}</span>
              <h1 id="analysis-progress-title">
                문서를
                <br />
                분석하고 있습니다
              </h1>
            </div>
          </article>

          <p className={styles.srOnly} role="status">
            {statusText}
          </p>

          <ol className={styles.steps} aria-label="분석 진행 단계">
            {STEP_LABELS.map((label, i) => {
              const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
              return (
                <li
                  key={label}
                  className={
                    state === 'done'
                      ? styles.completedStep
                      : state === 'active'
                        ? styles.activeStep
                        : styles.pendingStep
                  }
                  aria-current={state === 'active' ? 'step' : undefined}
                >
                  <span className={styles.stepIcon} aria-hidden="true">
                    {state === 'done' ? <CheckIcon /> : state === 'active' ? <span className={styles.spinner} /> : null}
                  </span>
                  <span>{label}</span>
                  {state === 'active' && <span className={styles.stepChip}>진행 중</span>}
                  {state === 'pending' && <span className={styles.stepChipMuted}>대기</span>}
                </li>
              );
            })}
          </ol>

          {summaryLine && (
            <div className={styles.summaryPanel}>
              <p className={styles.summaryHeadline}>{summaryLine}</p>
              <p className={styles.summarySub}>정밀 검토와 원문 근거 확인을 계속하고 있습니다.</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {onCancel && (
            <button type="button" className={styles.cancelAction} onClick={onCancel}>
              분석 취소하고 돌아가기
            </button>
          )}
          <p className={styles.privacy}>
            <ShieldIcon />
            원본 이미지는 서버에 저장되지 않습니다
          </p>
        </div>
      </div>
    </section>
  );
}
