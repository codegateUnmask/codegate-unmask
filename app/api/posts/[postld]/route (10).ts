import { NextRequest, NextResponse } from 'next/server';
import { deletePost, getPostDetail, reportPost, toggleLike } from '@/lib/community/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { postId } = await params;
  const post = getPostDetail(postId, token);
  if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json(post);
}

/** body: { action: 'like' | 'report' } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { postId } = await params;
  const { action } = await req.json().catch(() => ({}));

  if (action === 'like') {
    const post = toggleLike(postId, token);
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(post);
  }
  if (action === 'report') {
    const result = reportPost(postId, token);
    if (result === 'not_found') return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    if (result === 'already') return NextResponse.json({ error: '이미 신고한 게시글입니다.' }, { status: 409 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "action은 'like' 또는 'report'여야 합니다." }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { postId } = await params;
  const result = deletePost(postId, token);
  if (result === 'not_found') return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
  if (result === 'forbidden') return NextResponse.json({ error: '본인 글만 삭제할 수 있습니다.' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
