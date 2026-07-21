import Link from 'next/link';
import styles from './page.module.css';

function ShieldLockedIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.75 27 7v7.7c0 6.65-4.52 12.24-11 14.55C9.52 26.94 5 21.35 5 14.7V7l11-4.25Z" />
      <rect x="11" y="14" width="10" height="8" rx="2" />
      <path d="M13.5 14v-1.5a2.5 2.5 0 0 1 5 0V14" />
    </svg>
  );
}

function DocumentScannerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M8 12h8M8 15h8" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.brandIcon}>
          <ShieldLockedIcon />
        </span>
        <span className={styles.brand}>unmask</span>
      </header>

      <section className={styles.hero} aria-labelledby="start-title">
        <div className={styles.introduction}>
          <div
            className={styles.illustration}
            role="img"
            aria-label="보호된 계약서 일러스트"
          />
          <h1 id="start-title">
            어려운 계약서,
            <br />
            서명하기 전에 숨겨진
            <br />
            위험부터 확인하세요.
          </h1>
          <p className={styles.description}>
            복잡한 법률 용어를 분석하여
            <br />
            안전한 거래를 돕는 AI 가이드
          </p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.cta} href="/scan">
            <DocumentScannerIcon />
            계약서 확인하기
          </Link>
          <p className={styles.login}>
            이미 가입하셨나요? <span>로그인하기</span>
          </p>
        </div>
      </section>
    </main>
  );
}
