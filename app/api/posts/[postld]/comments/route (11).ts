import { NextRequest, NextResponse } from 'next/server';
import { createComment, listComments } from '@/lib/community/server';
import type { CreateCommentRequest } from '@/lib/community/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { postId } = await params;
  return NextResponse.json(listComments(postId, token));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const body: CreateCommentRequest | null = await req.json().catch(() => null);
  if (!body?.content?.trim()) return NextResponse.json({ error: 'content는 필수입니다.' }, { status: 400 });
  const { postId } = await params;
  const comment = createComment({ postId, content: body.content, nickname: body.nickname, authorToken: token });
  if (!comment) return NextResponse.json({ error: '게시글을 찾을 수 없거나 삭제되었습니다.' }, { status: 404 });
  return NextResponse.json(comment, { status: 201 });
}
