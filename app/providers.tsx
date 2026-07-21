'use client';

import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MotionConfig } from 'motion/react';
import { SessionProvider } from 'next-auth/react';
import ProfileScopeSync from '@/components/auth/ProfileScopeSync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 진단 결과를 로그인 계정 단위로 정리 (다른 계정의 유형이 보이는 문제 방지) */}
      <ProfileScopeSync />
      <Theme theme={neutralTheme} mode="light">
        <LinkProvider component={Link}>
          <LayerProvider>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LayerProvider>
        </LinkProvider>
      </Theme>
    </SessionProvider>
  );
}
