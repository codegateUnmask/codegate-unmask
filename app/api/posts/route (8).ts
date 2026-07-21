import { NextRequest, NextResponse } from 'next/server';
import { createPost, listPosts } from '@/lib/community/server';
import type { BoardType, CreatePostRequest } from '@/lib/community/shared';

const BOARDS: BoardType[] = ['scam-case', 'report', 'free'];

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const board = req.nextUrl.searchParams.get('board') as BoardType | null;
  if (!board || !BOARDS.includes(board)) return NextResponse.json({ error: 'board 값이 올바르지 않습니다.' }, { status: 400 });
  return NextResponse.json(listPosts(board, token));
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-client-token');
  if (!token) return NextResponse.json({ error: 'x-client-token 헤더가 필요합니다.' }, { status: 400 });
  const body: CreatePostRequest | null = await req.json().catch(() => null);
  if (!body || !BOARDS.includes(body.boardType) || !body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }
  const post = createPost({ ...body, authorToken: token });
  return NextResponse.json(post, { status: 201 });
}
