// ============================================================
// POST /api/diagnose — [담당: 지식·프롬프트(C)]
// 문항 채점은 서버 왕복 없이도 되지만, API 계약(§5)을 지키기 위해 라우트로 노출합니다.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import type { DiagnoseRequest } from '@/lib/types';
import { scoreDiagnosis } from '@/lib/diagnosis/scoring';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as DiagnoseRequest;
  const profile = scoreDiagnosis(body.answers);
  return NextResponse.json(profile);
}
