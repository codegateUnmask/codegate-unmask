'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { ClipboardList, GraduationCap, Home, ScanLine, UserRound, Users } from 'lucide-react';
import { useScanStore } from '@/stores/scanStore';
import styles from './TabBar.module.css';

const TABS = [
  { href: '/diagnose', label: '유형분석', icon: ClipboardList },
  { href: '/scan', label: '계약서', icon: ScanLine },
  { href: '/', label: '홈', icon: Home },
  { href: '/train', label: '훈련소', icon: GraduationCap },
  { href: '/community', label: '커뮤니티', icon: Users },
  { href: '/me', label: '마이', icon: UserRound },
] as const;

const SQUISH = {
  y: [0, -8, 1, 0],
  scaleX: [1, 1.35, 1.04, 1],
  scaleY: [1, 0.65, 0.97, 1],
};

export default function TabBar() {
  const pathname = usePathname();
  const scanStatus = useScanStore((s) => s.status);
  const reduceMotion = useReducedMotion();

  // 판독 몰입 구간(progress→result→report)에서는 탭바를 숨긴다
  if (pathname.startsWith('/scan') && scanStatus !== 'idle') return null;

  const activeIndex = TABS.findIndex((tab) =>
    tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href),
  );

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.bar} aria-label="주요 메뉴">
        {activeIndex >= 0 && (
          <div className={styles.track} aria-hidden="true">
            <motion.div
              className={styles.slider}
              initial={false}
              animate={{ x: `${activeIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                key={activeIndex}
                className={styles.circle}
                initial={false}
                animate={reduceMotion ? undefined : SQUISH}
                transition={{
                  duration: 0.38,
                  times: [0, 0.3, 0.62, 1],
                  ease: ['easeOut', 'easeInOut', 'easeOut'],
                }}
              />
            </motion.div>
          </div>
        )}
        {TABS.map((tab, i) => {
          const active = i === activeIndex;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={active ? styles.tabActive : styles.tab}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
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
