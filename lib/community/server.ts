// 커뮤니티 인메모리 저장소. ⚠️ 실제 DB 없이 서버 메모리에 저장 → 재시작 시 초기화됩니다.

import { nicknameFromToken } from './shared';
import type { BoardType, CommentItem, PostDetail, PostSummary } from './shared';

const REPORT_THRESHOLD = 5;

interface InternalPost {
  id: string;
  boardType: BoardType;
  title: string;
  content: string;
  nickname: string;
  authorToken: string;
  likedBy: Set<string>;
  reportedBy: Set<string>;
  hidden: boolean;
  createdAt: string;
}
interface InternalComment {
  id: string;
  postId: string;
  content: string;
  nickname: string;
  authorToken: string;
  reportedBy: Set<string>;
  hidden: boolean;
  createdAt: string;
}

const g = globalThis as unknown as {
  __unmaskPosts?: Map<string, InternalPost>;
  __unmaskComments?: Map<string, InternalComment>;
};
const posts = g.__unmaskPosts ?? (g.__unmaskPosts = new Map());
const comments = g.__unmaskComments ?? (g.__unmaskComments = new Map());

let idCounter = 0;
const newId = (p: string) => `${p}_${Date.now().toString(36)}_${++idCounter}`;
const resolveNickname = (token: string, n?: string) =>
  n?.trim() ? n.trim().slice(0, 20) : nicknameFromToken(token);

function toSummary(p: InternalPost, viewer: string): PostSummary {
  return {
    id: p.id,
    boardType: p.boardType,
    title: p.title,
    nickname: p.nickname,
    likeCount: p.likedBy.size,
    commentCount: [...comments.values()].filter((c) => c.postId === p.id && !c.hidden).length,
    createdAt: p.createdAt,
    isMine: p.authorToken === viewer,
  };
}
function toDetail(p: InternalPost, viewer: string): PostDetail {
  return { ...toSummary(p, viewer), content: p.content, isLiked: p.likedBy.has(viewer) };
}
function toCommentItem(c: InternalComment, viewer: string): CommentItem {
  return {
    id: c.id,
    postId: c.postId,
    content: c.content,
    nickname: c.nickname,
    createdAt: c.createdAt,
    isMine: c.authorToken === viewer,
  };
}

export function createPost(params: {
  boardType: BoardType;
  title: string;
  content: string;
  nickname?: string;
  authorToken: string;
}): PostDetail {
  const post: InternalPost = {
    id: newId('post'),
    boardType: params.boardType,
    title: params.title.slice(0, 100),
    content: params.content.slice(0, 5000),
    nickname: resolveNickname(params.authorToken, params.nickname),
    authorToken: params.authorToken,
    likedBy: new Set(),
    reportedBy: new Set(),
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  posts.set(post.id, post);
  return toDetail(post, params.authorToken);
}

export function listPosts(boardType: BoardType, viewer: string): PostSummary[] {
  return [...posts.values()]
    .filter((p) => p.boardType === boardType && !p.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => toSummary(p, viewer));
}

export function getPostDetail(postId: string, viewer: string): PostDetail | null {
  const p = posts.get(postId);
  if (!p || (p.hidden && p.authorToken !== viewer)) return null;
  return toDetail(p, viewer);
}

export function deletePost(postId: string, viewer: string): 'ok' | 'not_found' | 'forbidden' {
  const p = posts.get(postId);
  if (!p) return 'not_found';
  if (p.authorToken !== viewer) return 'forbidden';
  p.hidden = true;
  p.content = '작성자가 삭제한 게시글입니다.';
  return 'ok';
}

export function toggleLike(postId: string, viewer: string): PostDetail | null {
  const p = posts.get(postId);
  if (!p || p.hidden) return null;
  p.likedBy.has(viewer) ? p.likedBy.delete(viewer) : p.likedBy.add(viewer);
  return toDetail(p, viewer);
}

export function reportPost(postId: string, viewer: string): 'ok' | 'not_found' | 'already' {
  const p = posts.get(postId);
  if (!p) return 'not_found';
  if (p.reportedBy.has(viewer)) return 'already';
  p.reportedBy.add(viewer);
  if (p.reportedBy.size >= REPORT_THRESHOLD) p.hidden = true;
  return 'ok';
}

export function createComment(params: {
  postId: string;
  content: string;
  nickname?: string;
  authorToken: string;
}): CommentItem | null {
  const post = posts.get(params.postId);
  if (!post || post.hidden) return null;
  const c: InternalComment = {
    id: newId('cmt'),
    postId: params.postId,
    content: params.content.slice(0, 1000),
    nickname: resolveNickname(params.authorToken, params.nickname),
    authorToken: params.authorToken,
    reportedBy: new Set(),
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  comments.set(c.id, c);
  return toCommentItem(c, params.authorToken);
}

export function listComments(postId: string, viewer: string): CommentItem[] {
  return [...comments.values()]
    .filter((c) => c.postId === postId && !c.hidden)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => toCommentItem(c, viewer));
}

export function deleteComment(commentId: string, viewer: string): 'ok' | 'not_found' | 'forbidden' {
  const c = comments.get(commentId);
  if (!c) return 'not_found';
  if (c.authorToken !== viewer) return 'forbidden';
  c.hidden = true;
  c.content = '작성자가 삭제한 댓글입니다.';
  return 'ok';
}

export function reportComment(commentId: string, viewer: string): 'ok' | 'not_found' | 'already' {
  const c = comments.get(commentId);
  if (!c) return 'not_found';
  if (c.reportedBy.has(viewer)) return 'already';
  c.reportedBy.add(viewer);
  if (c.reportedBy.size >= REPORT_THRESHOLD) c.hidden = true;
  return 'ok';
}
