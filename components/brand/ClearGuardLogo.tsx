import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ClearGuardLogo.module.css';

// 최종 로고: public/logo-shield.png (라임 방패 + 문서 + 체크, 배경 투명).
// 로고가 바뀌면 그 파일만 갈아끼우면 됩니다.

type ClearGuardLogoProps = {
  variant?: 'lockup' | 'mark';
  size?: number;
  className?: string;
  tone?: 'default' | 'light';
  /** 홈으로 가는 링크로 감쌀지 (헤더 로고는 누르면 홈으로 가는 게 관례) */
  asHomeLink?: boolean;
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
  asHomeLink = false,
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

  const inner =
    variant === 'mark' ? (
      <span className={rootClassName} style={style} aria-label="ClearGuard" role="img">
        <ShieldMark size={size} />
      </span>
    ) : (
      <span className={rootClassName} style={style}>
        <span className={styles.mark}>
          <ShieldMark size={size} />
        </span>
        <span className={styles.wordmark}>
          Clear<span className={styles.wordmarkAccent}>Guard</span>
        </span>
      </span>
    );

  if (!asHomeLink) return inner;

  return (
    <Link href="/" aria-label="ClearGuard 홈으로" style={{ display: 'inline-flex' }}>
      {inner}
    </Link>
  );
}
