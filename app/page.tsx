import Link from 'next/link';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import styles from './page.module.css';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';

function DocumentScannerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M8 12h8M8 15h8" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z" />
      <path d="M9 11h6M9 14h4" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
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

/** 목적별 진입 — "무엇을 하러 왔는지"로 나눕니다. */
const ENTRIES = [
  {
    href: '/scan',
    icon: DocumentScannerIcon,
    title: '계약서·약관 확인',
    description: '전월세·근로계약·헬스장 회원권·구독 약관의 불리한 조항을 근거와 함께 짚어드려요.',
    primary: true,
  },
  {
    href: '/scan?type=message',
    icon: MessageIcon,
    title: '수상한 문자 확인',
    description: '스미싱·사칭 문자인지 신호를 하나씩 확인하고, 지금 해야 할 일을 알려드려요.',
    primary: false,
  },
  {
    href: '/diagnose',
    icon: ProfileIcon,
    title: '내 사기 취약 유형 진단',
    description: '1분 16문항으로 내가 어떤 수법에 약한지 알아보고, 판독에 맞춤 경고를 받아요.',
    primary: false,
  },
] as const;

export default function Home() {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <Link href="/" aria-label="ClearGuard 홈으로" className={styles.brandLink}>
          <ClearGuardLogo variant="lockup" size={30} />
        </Link>
      </header>

      <section className={styles.hero} aria-labelledby="start-title">
        <div className={styles.introduction}>
          <div className={styles.logoHero} role="img" aria-label="ClearGuard 로고">
            <ClearGuardLogo variant="mark" size={156} className={styles.logoHeroMark} />
          </div>
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

        <nav className={styles.entries} aria-label="무엇을 하시겠어요?">
          <p className={styles.entriesLabel}>무엇을 도와드릴까요?</p>
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <div key={entry.href} className={entry.primary ? styles.entryPrimary : undefined}>
                <ClickableCard label={entry.title} href={entry.href}>
                  <span className={styles.entryInner}>
                    <span className={styles.entryIcon}>
                      <Icon />
                    </span>
                    <span className={styles.entryBody}>
                      <strong>{entry.title}</strong>
                      <span>{entry.description}</span>
                    </span>
                    <span className={styles.entryArrow}>
                      <ArrowIcon />
                    </span>
                  </span>
                </ClickableCard>
              </div>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
