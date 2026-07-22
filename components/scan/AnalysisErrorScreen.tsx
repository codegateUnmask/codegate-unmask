import styles from './AnalysisErrorScreen.module.css';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20 5.6v5.6c0 4.84-3.29 8.91-8 10.6-4.71-1.69-8-5.76-8-10.6V5.6L12 2.5Z" />
      <path d="m8.7 12 2.1 2.1 4.7-4.7" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m11 6-6 6 6 6M5 12h14" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 7.6v5.2" />
      <path d="M12 16.4h.01" />
    </svg>
  );
}

const COPY = {
  network: {
    title: '분석 연결이 끊어졌어요.',
    description: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
  },
  server: {
    title: '분석을 완료하지 못했어요.',
    description: '일시적인 문제일 수 있어요. 잠시 후 다시 시도해 주세요.',
  },
} as const;

export interface AnalysisErrorScreenProps {
  kind: 'network' | 'server';
  onRetry: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function AnalysisErrorScreen({ kind, onRetry, onEdit, onBack }: AnalysisErrorScreenProps) {
  const copy = COPY[kind];

  return (
    <section className={styles.screen} aria-labelledby="analysis-error-title">
      <header className={styles.header}>
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="이전 화면으로">
          <BackIcon />
        </button>
        <ClearGuardLogo size={26} />
        <span />
      </header>

      <div className={styles.content}>
        <div className={styles.message} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">
            <AlertIcon />
          </span>
          <h1 id="analysis-error-title">{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <p className={styles.notice}>입력한 내용은 현재 화면에 그대로 남아 있습니다.</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryAction} onClick={onRetry}>
          다시 시도하기
        </button>
        <button type="button" className={styles.secondaryAction} onClick={onEdit}>
          내용 수정하기
        </button>
      </div>
    </section>
  );
}
