'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ClipboardList, Home, ScanLine, UserRound, Users } from 'lucide-react';
import { useScanStore } from '@/stores/scanStore';
import styles from './TabBar.module.css';

const TABS = [
  { href: '/diagnose', label: '유형분석', icon: ClipboardList },
  { href: '/scan', label: '계약서', icon: ScanLine },
  { href: '/', label: '홈', icon: Home },
  { href: '/community', label: '커뮤니티', icon: Users },
  { href: '/me', label: '마이', icon: UserRound },
] as const;

export default function TabBar() {
  const pathname = usePathname();
  const scanStatus = useScanStore((s) => s.status);

  // 판독 몰입 구간(progress→result→report)에서는 탭바를 숨긴다
  if (pathname.startsWith('/scan') && scanStatus !== 'idle') return null;

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.bar} aria-label="주요 메뉴">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={active ? styles.tabActive : styles.tab}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                {active && (
                  <motion.span
                    layoutId="tabbar-active-pill"
                    className={styles.activePill}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  />
                )}
                <Icon
                  className={styles.icon}
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden="true"
                />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
