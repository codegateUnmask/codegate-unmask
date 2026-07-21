'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@astryxdesign/core/Badge';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useCommunityStore } from '@/stores/communityStore';
import { KIND_LABEL } from '@/lib/mock.community';
import styles from '../community.module.css';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.7-7.5-10A4.5 4.5 0 0 1 12 7.3a4.5 4.5 0 0 1 7.5 3.2c0 5.3-7.5 10-7.5 10Z" />
    </svg>
  );
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const post = useCommunityStore((s) => s.posts).find((p) => p.id === id);
  const [isLiked, setIsLiked] = useState(false);

  if (!post) notFound();

  return (
    <main className={styles.screen}>
      <div className={styles.topbar}>
        <Link href="/community" className={styles.backButton} aria-label="커뮤니티 목록으로 돌아가기">
          <BackIcon />
        </Link>
        <h1 className={styles.topbarTitle}>커뮤니티</h1>
        <span aria-hidden="true" />
      </div>

      <article>
        <header className={styles.detailHead}>
          <span className={styles.cardTop}>
            <Badge
              variant={post.kind === 'report' ? 'warning' : 'neutral'}
              label={KIND_LABEL[post.kind]}
            />
            {post.docTypeTag && <span className={styles.tag}>{post.docTypeTag}</span>}
          </span>
          <h2 className={styles.detailTitle}>{post.title}</h2>
          <p className={styles.detailMeta}>
            {post.author} · {post.createdAt}
          </p>
        </header>

        <p className={styles.detailBody}>{post.body}</p>

        <div className={styles.likeRow}>
          <button
            type="button"
            className={styles.likeButton}
            aria-pressed={isLiked}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
            onClick={() => setIsLiked((v) => !v)}
          >
            <HeartIcon />
            좋아요 {post.likes + (isLiked ? 1 : 0)}
          </button>
        </div>
      </article>

      <section aria-label="댓글">
        <h3 className={styles.sectionTitle}>댓글 {post.comments.length}</h3>
        <ul className={styles.commentList}>
          {post.comments.map((comment, index) => (
            <li key={index} className={styles.comment}>
              <p className={styles.commentMeta}>
                <strong>{comment.author}</strong> · {comment.createdAt}
              </p>
              <p className={styles.commentBody}>{comment.body}</p>
            </li>
          ))}
        </ul>

        <div className={styles.commentInput}>
          <TextInput
            label="댓글 입력"
            isLabelHidden
            value=""
            placeholder="댓글을 입력하세요"
            isDisabled
          />
          <p className={styles.commentNote}>데모에서는 댓글 작성을 지원하지 않아요</p>
        </div>
      </section>
    </main>
  );
}
