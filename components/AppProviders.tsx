'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MotionConfig } from 'motion/react';
import { motionTransition } from '@/lib/ui/motion';

export function AppProviders({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateConnection = () => setOffline(!navigator.onLine);

    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .catch(() => undefined);
    }

    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  return (
    <Theme theme={neutralTheme} mode="light">
      <MotionConfig reducedMotion="user" transition={motionTransition}>
        <div className="app-viewport">
          {offline && (
            <div className="offline-notice" role="status" aria-live="polite">
              <span>오프라인에서는 계약서를 분석할 수 없습니다.</span>
              <button type="button" onClick={() => window.location.reload()}>
                다시 시도
              </button>
            </div>
          )}
          <div className={`app-safe-area${offline ? ' app-safe-area--offline' : ''}`}>
            {children}
          </div>
        </div>
      </MotionConfig>
    </Theme>
  );
}
