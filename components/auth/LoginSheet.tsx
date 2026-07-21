'use client';

// 로그인 게이트 — 화면을 떠나지 않고 시트에서 바로 소셜 로그인한다.
// 소셜 버튼은 "환경변수가 있는 프로바이더만" 노출 (NextAuth /api/auth/providers 기준).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import styles from './LoginSheet.module.css';

const SOCIAL_ORDER = ['kakao', 'google', 'naver'] as const;
type SocialProvider = (typeof SOCIAL_ORDER)[number];

function KakaoLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#191919"
        d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.86 5.33 4.66 6.74-.2.74-.73 2.68-.84 3.1-.13.52.19.51.4.37.17-.11 2.65-1.8 3.72-2.53.66.1 1.35.15 2.06.15 5.52 0 10-3.58 10-8S17.52 3 12 3Z"
      />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function NaverLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <path fill="#ffffff" d="M13.56 10.4 6.94 1H1v18h5.44V9.6L13.06 19H19V1h-5.44v9.4Z" />
    </svg>
  );
}

const SOCIAL_META: Record<
  SocialProvider,
  { label: string; className: string; logo: () => React.ReactElement }
> = {
  kakao: { label: '카카오로 계속하기', className: 'kakaoButton', logo: KakaoLogo },
  google: { label: 'Google로 계속하기', className: 'googleButton', logo: GoogleLogo },
  naver: { label: '네이버로 계속하기', className: 'naverButton', logo: NaverLogo },
};

export interface LoginSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** 로그인 후 돌아올 경로. 비우면 지금 보고 있는 화면으로 돌아옵니다. */
  callbackPath?: string;
}

export default function LoginSheet({ isOpen, onOpenChange, callbackPath }: LoginSheetProps) {
  const pathname = usePathname();
  const callbackUrl = callbackPath ?? pathname;
  const [enabled, setEnabled] = useState<SocialProvider[] | null>(null);

  useEffect(() => {
    if (!isOpen || enabled !== null) return;
    fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : {}))
      .then((providers: Record<string, unknown>) =>
        setEnabled(SOCIAL_ORDER.filter((p) => p in providers)),
      )
      .catch(() => setEnabled([]));
  }, [isOpen, enabled]);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={360}>
      <div className={styles.body}>
        <h2 className={styles.title}>ClearGuard 시작하기</h2>
        <p className={styles.description}>
          로그인하면 진단 결과와 분석 기록이 계정에 연결됩니다.
        </p>
        {(enabled ?? []).map((p) => {
          const meta = SOCIAL_META[p];
          const Logo = meta.logo;
          return (
            <button
              key={p}
              type="button"
              className={`${styles.socialButton} ${styles[meta.className]}`}
              onClick={() => void signIn(p, { callbackUrl })}
            >
              <Logo />
              {meta.label}
            </button>
          );
        })}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className={styles.guestLink}
          onClick={() => onOpenChange(false)}
        >
          닉네임만 입력하고 체험하기
        </Link>
        <Button label="다음에 할게요" variant="ghost" width="100%" onClick={() => onOpenChange(false)} />
        <p className={styles.notice}>이름·이메일만 받아 로그인 유지에 쓰고, 판독 원문은 저장하지 않아요.</p>
      </div>
    </Dialog>
  );
}
