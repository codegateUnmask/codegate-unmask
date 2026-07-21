import type { CSSProperties } from 'react';
import styles from './ClearGuardLogo.module.css';

type ClearGuardLogoProps = {
  variant?: 'lockup' | 'mark';
  size?: number;
  className?: string;
  tone?: 'default' | 'light';
};

function ShieldMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={styles.svg}
      style={{ width: size, height: size }}
    >
      <path
        d="M68 14c10 4 18 7 28 10v31c0 24-14 43-36 56-22-13-36-32-36-56V24c10-3 18-6 28-10h16Z"
        fill="#06B6D4"
        opacity="0.82"
        transform="translate(10 0)"
      />
      <path
        d="M60 12c10 4 18 7 28 10v31c0 24-14 43-36 56-22-13-36-32-36-56V22c10-3 18-6 28-10h16Z"
        fill="#2563EB"
      />
      <path
        d="M40 67.5 53.5 81 88 45"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9.5"
      />
    </svg>
  );
}

export function ClearGuardLogo({
  variant = 'lockup',
  size = 32,
  className = '',
  tone = 'default',
}: ClearGuardLogoProps) {
  const rootClassName = [
    styles.root,
    variant === 'lockup' ? styles.lockup : styles.markOnly,
    tone === 'light' ? styles.light : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = { '--clearguard-mark-size': `${size}px` } as CSSProperties;

  if (variant === 'mark') {
    return (
      <span className={rootClassName} style={style} aria-label="ClearGuard" role="img">
        <ShieldMark size={size} />
      </span>
    );
  }

  return (
    <span className={rootClassName} style={style}>
      <span className={styles.mark}>
        <ShieldMark size={size} />
      </span>
      <span className={styles.wordmark}>ClearGuard</span>
    </span>
  );
}
