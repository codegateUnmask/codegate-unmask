'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

/* 라우트 진입 모션. /scan은 계약서를 읽는 화면이라 모션을 걸지 않는다. */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/scan')) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
