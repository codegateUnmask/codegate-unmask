'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './RequestPhrasesScreen.module.css';

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

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export interface RequestPhrase {
  text: string;
  riskLabel?: string;
}

export interface RequestPhrasesScreenProps {
  phrases: RequestPhrase[];
  onNewScan: () => void;
  onBackToReport: () => void;
}

export default function RequestPhrasesScreen({
  phrases,
  onNewScan,
  onBackToReport,
}: RequestPhrasesScreenProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      const ok = document.execCommand('copy');
      fallback.remove();
      if (!ok) return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.headerIcon}
          onClick={onBackToReport}
          aria-label="리포트로 돌아가기"
        >
          <BackIcon />
        </button>
        <span className={styles.brand}>
          <span className={styles.brandIcon}>
            <ShieldIcon />
          </span>
          <span>ClearGuard</span>
        </span>
        <span aria-hidden="true" />
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>계약 전에 이렇게 물어보세요.</h1>
        <p className={styles.subtitle}>
          그대로 읽거나 복사해서 보내면 됩니다. 답변은 문자처럼 기록이 남는 방식으로 받는 게 안전해요.
        </p>

        <ol className={styles.list}>
          {phrases.map((phrase, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.number}>{i + 1}</span>
              <div className={styles.itemBody}>
                {phrase.riskLabel && <span className={styles.riskLabel}>{phrase.riskLabel}</span>}
                <p className={styles.phrase}>{phrase.text}</p>
              </div>
              <button
                type="button"
                className={styles.copyButton}
                onClick={() => handleCopy(phrase.text)}
                aria-label={`${i + 1}번 문구 복사`}
              >
                <CopyIcon />
              </button>
            </li>
          ))}
        </ol>
      </main>

      <div role="status" aria-live="polite" className={styles.toast} data-visible={copied}>
        {copied ? '복사되었습니다.' : ''}
      </div>

      <div className={styles.bottomDock}>
        <button type="button" className={styles.cta} onClick={onNewScan}>
          새 계약서 분석하기
        </button>
        <button type="button" className={styles.secondary} onClick={onBackToReport}>
          리포트로 돌아가기
        </button>
      </div>
    </div>
  );
}
