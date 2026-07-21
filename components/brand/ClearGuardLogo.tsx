import type { CSSProperties } from 'react';
import styles from './ClearGuardLogo.module.css';

// 최종 로고 (현찬 확정, "찐 clearguard 로고.svg" 기준):
// 라임(#d7e21e) 방패 외곽선 + 문서 + 테두리를 뚫고 나가는 체크마크.
// 앱의 Acid Lime 액센트와 같은 계열이라 화면 어디에 놓아도 어울립니다.

type ClearGuardLogoProps = {
  variant?: 'lockup' | 'mark';
  size?: number;
  className?: string;
  tone?: 'default' | 'light';
};

const ACCENT = '#d7e21e';

function ShieldMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="125 10 465 545"
      aria-hidden="true"
      className={styles.svg}
      style={{ width: size, height: size }}
    >
      {/* 방패 외곽선: 위는 각지고 아래는 뾰족하게 */}
      <path
        d="M 350 40 L 545 105 L 545 290 C 545 400 470 470 350 525 C 230 470 155 400 155 290 L 155 105 Z"
        fill="none"
        stroke={ACCENT}
        strokeWidth="16"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 문서 (오른쪽 아래 모서리 접힘) */}
      <path d="M 255 150 L 445 150 L 445 340 L 400 385 L 255 385 Z" fill={ACCENT} />
      <path d="M 400 340 L 445 340 L 400 385 Z" fill="#ffffff" />
      {/* 문서 안 텍스트 라인 */}
      <rect x="285" y="195" width="130" height="18" fill="#111111" />
      <rect x="285" y="235" width="130" height="18" fill="#111111" />
      <rect x="285" y="275" width="85" height="18" fill="#111111" />
      {/* 체크마크: 방패 테두리를 가로질러 바깥으로 */}
      <path
        d="M 335 390 L 405 450 L 560 310"
        fill="none"
        stroke={ACCENT}
        strokeWidth="32"
        strokeLinejoin="round"
        strokeLinecap="round"
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
      <span className={styles.wordmark}>
        Clear<span className={styles.wordmarkAccent}>Guard</span>
      </span>
    </span>
  );
}
