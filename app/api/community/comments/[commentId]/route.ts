import { NextRequest, NextResponse } from 'next/server';
import { deleteComment, reportComment } from '@/lib/community/server';

/** body: { action: 'report' } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { commentId } = await params;
  const { action } = await req.json().catch(() => ({}));
  if (action !== 'report') return NextResponse.json({ error: "action은 'report'여야 합니다." }, { status: 400 });
  const result = reportComment(commentId, token);
  if (result === 'not_found') return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
  if (result === 'already') return NextResponse.json({ error: '이미 신고한 댓글입니다.' }, { status: 409 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const { commentId } = await params;
  const result = deleteComment(commentId, token);
  if (result === 'not_found') return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
  if (result === 'forbidden') return NextResponse.json({ error: '본인 댓글만 삭제할 수 있습니다.' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
