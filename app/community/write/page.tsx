'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BOARD_META, BOARD_ORDER } from '@/lib/community/shared';
import type { BoardType } from '@/lib/community/shared';
import { getClientToken } from '@/lib/community/client';

function WriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBoard = (searchParams.get('board') as BoardType) || 'scam-case';

  const [boardType, setBoardType] = useState<BoardType>(initialBoard);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 모두 입력해주세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client-token': getClientToken() },
        body: JSON.stringify({ boardType, title, content, nickname: nickname || undefined }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || '작성에 실패했습니다.');
      const post = await res.json();
      router.push(`/community/${post.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-6 py-12">
      <h1 className="text-2xl font-bold">글쓰기</h1>

      <div className="flex gap-2">
        {BOARD_ORDER.map((b) => (
          <button key={b} type="button" onClick={() => setBoardType(b)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              boardType === b ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400'
            }`}
          >
            {BOARD_META[b].label}
          </button>
        ))}
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" maxLength={100}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />

      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={10} maxLength={5000}
        className="resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900" />

      <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임 (비워두면 자동 생성)" maxLength={20}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={submitting}
        className="self-start rounded-full bg-neutral-900 px-6 py-3 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900">
        {submitting ? '등록 중...' : '등록하기'}
      </button>
    </main>
  );
}

// useSearchParams()는 Suspense 경계 안에서만 쓸 수 있습니다 (Next.js 15 정적 생성 요건)
export default function WritePage() {
  return (
    <Suspense fallback={null}>
      <WriteForm />
    </Suspense>
  );
}
