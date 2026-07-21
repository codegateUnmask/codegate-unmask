'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import LoginSheet from '@/components/auth/LoginSheet';
import { useAuthStore } from '@/stores/authStore';
import { BOARD_META, BOARD_ORDER } from '@/lib/community/shared';
import type { BoardType, PostSummary } from '@/lib/community/shared';
import { getClientToken } from '@/lib/community/client';
import styles from './community.module.css';

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

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

type FeedStatus = 'loading' | 'error' | 'ready';

export default function CommunityPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [board, setBoard] = useState<BoardType>('scam-case');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/community/posts?board=${board}`, {
      headers: { 'x-client-token': getClientToken() },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: PostSummary[]) => {
        if (cancelled) return;
        setPosts(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [board, reloadKey]);

  function handleWrite() {
    if (user) {
      router.push(`/community/write?board=${board}`);
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
        <div className={styles.chipRow} role="group" aria-label="게시판 선택">
          {BOARD_ORDER.map((b) => (
            <button
              key={b}
              type="button"
              className={styles.chip}
              aria-pressed={board === b}
              onClick={() => setBoard(b)}
            >
              {BOARD_META[b].label}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && (
        <ul className={styles.list} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className={styles.card} style={{ opacity: 0.5 }}>
              <p className={styles.cardTitle}>&nbsp;</p>
              <p className={styles.cardBody}>&nbsp;</p>
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <EmptyState
          isCompact
          title="목록을 불러오지 못했어요"
          description="네트워크 상태를 확인하고 다시 시도해주세요."
          actions={
            <Button label="다시 시도" variant="primary" onClick={() => setReloadKey((k) => k + 1)} />
          }
        />
      )}

      {status === 'ready' && posts.length === 0 && (
        <EmptyState
          isCompact
          title="아직 글이 없어요"
          description="첫 글을 남겨보세요."
          actions={<Button label="첫 글 쓰러 가기" variant="primary" onClick={handleWrite} />}
        />
      )}

      {status === 'ready' && posts.length > 0 && (
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
                  <span className={styles.tag}>{BOARD_META[post.boardType].label}</span>
                </span>
                <p className={styles.cardTitle}>{post.title}</p>
                <span className={styles.cardMeta}>
                  <span className={styles.metaByline}>
                    {post.nickname} · {timeAgo(post.createdAt)}
                  </span>
                  <span className={styles.metaCount}>
                    <HeartIcon />
                    {post.likeCount}
                  </span>
                  <span className={styles.metaCount}>
                    <CommentIcon />
                    {post.commentCount}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.fixedCta} onClick={handleWrite} aria-label="사기 수법 제보 글쓰기">
        <PenIcon />
        제보하기
      </button>

      <LoginSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={() => router.push(`/community/write?board=${board}`)}
      />
    </main>
  );
}
