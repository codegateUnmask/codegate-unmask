'use client';

import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MotionConfig } from 'motion/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={neutralTheme} mode="light">
      <LinkProvider component={Link}>
        <LayerProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LayerProvider>
      </LinkProvider>
    </Theme>
  );
}
