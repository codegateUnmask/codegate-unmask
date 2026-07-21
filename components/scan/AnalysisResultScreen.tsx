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

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7" />
      <path d="M4 4v4.7h4.7M12 7.5V12l3 2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06L7.03 4.2l.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.04 1.52 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.87A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

export default function AnalysisResultScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <BackIcon />
        </span>
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
        <section className={styles.summary} aria-labelledby="analysis-summary-title">
          <span className={styles.summaryIcon}>
            <AlertIcon />
          </span>
          <div>
            <p className={styles.eyebrow}>계약서 분석 결과</p>
            <h1 id="analysis-summary-title">서명을 권하지 않아요</h1>
            <p className={styles.summaryCopy}>
              심각한 독소조항 2개가 발견되었습니다. 특히 위약금 관련 조항이 임차인에게
              매우 불리하게 작성되어 있어 수정이 필요합니다.
            </p>
          </div>
        </section>

        <section className={styles.findings} aria-label="발견된 독소조항">
          <article className={styles.findingCard}>
            <header className={styles.findingHeader}>
              <span className={`${styles.badge} ${styles.dangerBadge}`}>위험</span>
              <h2>위약금 조항</h2>
            </header>

            <blockquote className={styles.quote}>
              &ldquo;제 7조 (계약의 해지) 임차인이 본 계약을 중도 해지할 경우,{' '}
              <mark className={styles.dangerMark}>
                남은 계약 기간의 월세 전액을 위약금으로 지불
              </mark>
              해야 한다.&rdquo;
            </blockquote>

            <div className={styles.explanation}>
              <h3>왜 위험한가요?</h3>
              <p>
                통상적인 위약금은 월세의 1~2개월치 또는 보증금의 10% 수준입니다. 남은 기간
                전액을 요구하는 것은 과도하며 법적 분쟁의 소지가 높습니다.
              </p>
            </div>

            <div className={styles.suggestion}>
              <span>특약 문구 제안</span>
              <p>
                &ldquo;임차인의 사정으로 중도 해지 시, 위약금은 월세의 1개월분으로 한다. 단,
                새로운 임차인을 주선한 경우 위약금을 면제한다.&rdquo;
              </p>
            </div>

            <span className={styles.sourceChip}>
              <BookIcon />
              국토교통부 표준임대차계약서 확인
            </span>
          </article>

          <article className={styles.findingCard}>
            <header className={styles.findingHeader}>
              <span className={`${styles.badge} ${styles.warningBadge}`}>주의</span>
              <h2>원상복구 조항</h2>
            </header>

            <blockquote className={styles.quote}>
              &ldquo;제 8조 (원상복구) 임대차 계약 종료 시, 임차인은{' '}
              <mark className={styles.warningMark}>새로운 상태로 원상복구</mark>하여
              반환한다.&rdquo;
            </blockquote>

            <div className={styles.explanation}>
              <h3>왜 주의해야 하나요?</h3>
              <p>
                &apos;새로운 상태&apos;라는 표현이 모호합니다. 통상적인 마모(자연 손실)에 대한
                책임까지 임차인에게 전가될 수 있습니다.
              </p>
            </div>

            <div className={styles.suggestion}>
              <span>특약 문구 제안</span>
              <p>
                &ldquo;원상복구의 범위는 입주 당시의 상태를 기준으로 하되, 시간 경과에 따른
                통상적인 마모 및 자연 훼손은 제외한다.&rdquo;
              </p>
            </div>
          </article>
        </section>
      </main>

      <div className={styles.bottomDock}>
        <span className={styles.cta}>
          임대인에게 물어볼 질문 보기
          <ArrowIcon />
        </span>
        <nav className={styles.navigation} aria-label="주요 메뉴">
          <span className={`${styles.navItem} ${styles.navItemActive}`}>
            <HomeIcon />
            홈
          </span>
          <span className={styles.navItem}>
            <HistoryIcon />
            히스토리
          </span>
          <span className={styles.navItem}>
            <SettingsIcon />
            설정
          </span>
        </nav>
      </div>
    </div>
  );
}
