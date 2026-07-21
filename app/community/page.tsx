'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BOARD_META, BOARD_ORDER } from '@/lib/community/shared';
import type { BoardType, PostSummary } from '@/lib/community/shared';
import { getClientToken } from '@/lib/community/client';

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function CommunityPage() {
  const [board, setBoard] = useState<BoardType>('scam-case');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/community/posts?board=${board}`, { headers: { 'x-client-token': getClientToken() } })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setPosts(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [board]);

  const meta = BOARD_META[board];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <p className="mt-1 text-sm text-neutral-500">{meta.description}</p>
      </div>

      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {BOARD_ORDER.map((b) => (
          <button
            key={b}
            onClick={() => setBoard(b)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              board === b ? `border-current ${BOARD_META[b].accent}` : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            {BOARD_META[b].label}
          </button>
        ))}
      </div>

      <Link href={`/community/write?board=${board}`} className="self-end rounded-full bg-neutral-900 px-5 py-2 text-sm text-white dark:bg-white dark:text-neutral-900">
        글쓰기
      </Link>

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-neutral-500">불러오는 중...</p>}
        {!loading && posts.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
            아직 글이 없어요. 첫 글을 남겨보세요!
          </p>
        )}
        {posts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`} className="rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{post.title}</h2>
              {post.isMine && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.accentBg} ${meta.accent}`}>내 글</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
              <span>{post.nickname}</span>
              <span>{timeAgo(post.createdAt)}</span>
              <span>❤ {post.likeCount}</span>
              <span>💬 {post.commentCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
