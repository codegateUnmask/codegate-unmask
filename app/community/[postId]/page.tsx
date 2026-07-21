'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import { BOARD_META } from '@/lib/community/shared';
import type { CommentItem, PostDetail } from '@/lib/community/shared';
import { getClientToken } from '@/lib/community/client';

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = usePromise(params);
  const router = useRouter();
  const token = getClientToken();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [notFound, setNotFound] = useState(false);

  async function loadAll() {
    const [postRes, commentsRes] = await Promise.all([
      fetch(`/api/community/posts/${postId}`, { headers: { 'x-client-token': token } }),
      fetch(`/api/community/posts/${postId}/comments`, { headers: { 'x-client-token': token } }),
    ]);
    if (!postRes.ok) { setNotFound(true); return; }
    setPost(await postRes.json());
    setComments(await commentsRes.json());
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [postId]);

  async function patchPost(action: 'like' | 'report') {
    const res = await fetch(`/api/community/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-client-token': token },
      body: JSON.stringify({ action }),
    });
    if (action === 'like' && res.ok) setPost(await res.json());
    if (action === 'report') {
      if (res.ok) alert('신고가 접수되었습니다.');
      else alert((await res.json().catch(() => ({}))).error || '신고 실패');
    }
  }

  async function deletePostAction() {
    if (!confirm('게시글을 삭제할까요?')) return;
    const res = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE', headers: { 'x-client-token': token } });
    if (res.ok) router.push('/community');
  }

  async function submitComment() {
    if (!commentInput.trim()) return;
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-client-token': token },
      body: JSON.stringify({ content: commentInput }),
    });
    if (res.ok) {
      setCommentInput('');
      const list = await fetch(`/api/community/posts/${postId}/comments`, { headers: { 'x-client-token': token } });
      setComments(await list.json());
      setPost((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : p));
    }
  }

  async function deleteCommentAction(commentId: string) {
    if (!confirm('댓글을 삭제할까요?')) return;
    const res = await fetch(`/api/community/comments/${commentId}`, { method: 'DELETE', headers: { 'x-client-token': token } });
    if (res.ok) {
      setComments((cs) => cs.filter((c) => c.id !== commentId));
      setPost((p) => (p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p));
    }
  }

  async function reportCommentAction(commentId: string) {
    const res = await fetch(`/api/community/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-client-token': token },
      body: JSON.stringify({ action: 'report' }),
    });
    if (res.ok) alert('신고가 접수되었습니다.');
    else alert((await res.json().catch(() => ({}))).error || '신고 실패');
  }

  if (notFound) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <p className="text-neutral-500">삭제되었거나 존재하지 않는 게시글이에요.</p>
        <button onClick={() => router.push('/community')} className="rounded-full border border-neutral-300 px-5 py-2 text-sm">목록으로</button>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 py-20">
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      </main>
    );
  }

  const meta = BOARD_META[post.boardType];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="rounded-2xl border border-neutral-200 p-6">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.accentBg} ${meta.accent}`}>{meta.label}</span>
        <h1 className="mt-3 text-xl font-bold">{post.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
          <span>{post.nickname}</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{post.content}</p>

        <div className="mt-6 flex items-center gap-2">
          <button onClick={() => patchPost('like')}
            className={`rounded-full border px-4 py-1.5 text-sm ${post.isLiked ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-neutral-300 text-neutral-600'}`}>
            ❤ 좋아요 {post.likeCount}
          </button>
          {post.isMine ? (
            <button onClick={deletePostAction} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600">삭제</button>
          ) : (
            <button onClick={() => patchPost('report')} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600">신고</button>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-neutral-500">댓글 {comments.length}</h2>
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">{c.nickname}</span>
                <span className="text-[11px] text-neutral-400">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-700">{c.content}</p>
              <div className="mt-1">
                {c.isMine ? (
                  <button onClick={() => deleteCommentAction(c.id)} className="text-[11px] text-neutral-400 hover:text-neutral-600">삭제</button>
                ) : (
                  <button onClick={() => reportCommentAction(c.id)} className="text-[11px] text-neutral-400 hover:text-neutral-600">신고</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            placeholder="댓글을 입력하세요" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <button onClick={submitComment} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">등록</button>
        </div>
      </div>
    </main>
  );
}
