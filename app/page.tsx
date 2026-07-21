'use client';

import { Button } from '@astryxdesign/core/Button';
import { motion } from 'motion/react';
import { motionTransition } from '@/lib/ui/motion';
import styles from './page.module.css';

function ShieldLock() {
  return (
    <svg viewBox="0 0 32 32">
      <path d="M16 2.75 27 7v7.7c0 6.65-4.52 12.24-11 14.55C9.52 26.94 5 21.35 5 14.7V7l11-4.25Z" />
      <rect x="11" y="14" width="10" height="8" rx="2" />
      <path d="M13.5 14v-1.5a2.5 2.5 0 0 1 5 0V14" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.brandIcon} aria-hidden="true">
          <ShieldLock />
        </span>
        <span className={styles.brand}>unmask</span>
      </header>

      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...motionTransition, duration: 0.28 }}
      >
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            AI 계약서 가이드
          </p>
          <h1>어려운 계약서, 서명하기 전에 숨겨진 위험부터 확인하세요.</h1>
          <p className={styles.description}>
            AI가 계약서의 위험 조항을 찾고 원문 근거와 함께 쉽게 설명해드려요.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            label="계약서 확인하기"
            href="/scan"
            variant="primary"
            size="lg"
            width="100%"
            className={styles.cta}
            style={{
              height: 52,
              borderRadius: 'var(--app-radius-control)',
              fontSize: 16,
              fontWeight: 700,
            }}
          />
          <p className={styles.login}>
            이미 계정이 있으신가요? <span>로그인</span>
          </p>
        </div>
      </motion.section>
    </main>
  );
}
