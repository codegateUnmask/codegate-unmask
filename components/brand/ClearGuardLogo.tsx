import type { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ClearGuardLogo.module.css';

// 최종 로고: public/logo-shield.png (라임 방패 + 문서 + 체크, 배경 투명).
// 로고가 바뀌면 그 파일만 갈아끼우면 됩니다.

type ClearGuardLogoProps = {
  variant?: 'lockup' | 'mark';
  size?: number;
  className?: string;
  tone?: 'default' | 'light';
};

function ShieldMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo-shield.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={styles.svg}
    />
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
      <span className={styles.wordmark}>
        Clear<span className={styles.wordmarkAccent}>Guard</span>
      </span>
    </span>
  );
}
