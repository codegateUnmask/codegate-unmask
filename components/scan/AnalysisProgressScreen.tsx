import styles from './AnalysisProgressScreen.module.css';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20 5.6v5.6c0 4.84-3.29 8.91-8 10.6-4.71-1.69-8-5.76-8-10.6V5.6L12 2.5Z" />
      <path d="m8.7 12 2.1 2.1 4.7-4.7" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M10 20h4" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 10.2 3.2 3.2L15 6.8" />
    </svg>
  );
}

export default function AnalysisProgressScreen() {
  return (
    <section className={styles.screen} aria-labelledby="analysis-progress-title">
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <ShieldIcon />
          </span>
          <span>unmask</span>
        </div>
        <span className={styles.notificationIcon} aria-hidden="true">
          <BellIcon />
          <span />
        </span>
      </header>

      <div className={styles.content}>
        <div>
          <article className={styles.documentCard}>
            <DocumentThumbnail />
            <div className={styles.documentCopy}>
              <span className={styles.badge}>부동산 임대차 계약서</span>
              <h1 id="analysis-progress-title">
                문서를
                <br />
                분석하고 있습니다
              </h1>
            </div>
          </article>

          <div className={styles.progressBlock}>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="계약서 분석 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={45}
            >
              <span />
            </div>
            <p>문서를 꼼꼼히 읽고 있습니다...</p>
          </div>

          <ol className={styles.steps}>
            <li className={styles.completedStep}>
              <span className={styles.stepIcon}>
                <CheckIcon />
              </span>
              <span>개인정보 마스킹 완료</span>
            </li>
            <li className={styles.activeStep}>
              <span className={styles.stepIcon} aria-hidden="true">
                <span />
              </span>
              <span>위험 조항 탐색 중...</span>
            </li>
            <li className={styles.pendingStep}>
              <span className={styles.stepIcon} aria-hidden="true" />
              <span>원문 근거 검증 대기</span>
            </li>
          </ol>
        </div>

        <p className={styles.privacy}>
          <ShieldIcon />
          원본 이미지는 서버에 저장되지 않습니다
        </p>
      </div>
    </section>
  );
}
