'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import LoginSheet from '@/components/auth/LoginSheet';
import { useAuthStore } from '@/stores/authStore';
import { useCommunityStore } from '@/stores/communityStore';
import { KIND_LABEL } from '@/lib/mock.community';
import styles from './community.module.css';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.7-7.5-10A4.5 4.5 0 0 1 12 7.3a4.5 4.5 0 0 1 7.5 3.2c0 5.3-7.5 10-7.5 10Z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const posts = useCommunityStore((s) => s.posts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function handleWrite() {
    if (user) {
      router.push('/community/new');
    } else {
      setIsSheetOpen(true);
    }
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>커뮤니티</h1>
        <p className={styles.subtitle}>이런 수법이 돌고 있어요</p>
      </header>

      <div className={styles.banner}>
        <Banner status="info" title="데모용 목업 데이터입니다" />
      </div>

      <ul className={styles.list}>
        {posts.map((post, index) => (
          <motion.li
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/community/${post.id}`} className={styles.card}>
              <span className={styles.cardTop}>
                <Badge
                  variant={post.kind === 'report' ? 'warning' : 'neutral'}
                  label={KIND_LABEL[post.kind]}
                />
                {post.docTypeTag && <span className={styles.tag}>{post.docTypeTag}</span>}
              </span>
              <p className={styles.cardTitle}>{post.title}</p>
              <p className={styles.cardBody}>{post.body}</p>
              <span className={styles.cardMeta}>
                <span className={styles.metaByline}>
                  {post.author} · {post.createdAt}
                </span>
                <span className={styles.metaCount}>
                  <HeartIcon />
                  {post.likes}
                </span>
                <span className={styles.metaCount}>
                  <CommentIcon />
                  {post.comments.length}
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <button type="button" className={styles.fixedCta} onClick={handleWrite} aria-label="사기 수법 제보 글쓰기">
        <PenIcon />
        제보하기
      </button>

      <LoginSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={() => router.push('/community/new')}
      />
    </main>
  );
}
