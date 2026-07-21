// ============================================================
// POST /api/diagnose
// body: DiagnoseRequest { answers: number[] }
// 응답: VulnProfile
//
// 진단 파트는 lib/diagnosis 안에서 완결되므로 다른 팀원 코드에
// 의존하지 않습니다. (LLM 호출 없음 — 순수 로직이라 비용도 0원)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { DiagnoseRequest } from '@/lib/types';
import { buildProfile } from '@/lib/diagnosis/scoring';
import { QUESTIONS } from '@/lib/diagnosis/questions';

export async function POST(req: NextRequest) {
  let body: DiagnoseRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const { answers } = body;

  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return NextResponse.json(
      {
        error: `answers는 길이 ${QUESTIONS.length}인 숫자 배열이어야 합니다.`,
        received: Array.isArray(answers) ? answers.length : typeof answers,
      },
      { status: 400 }
    );
  }

  if (!answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3)) {
    return NextResponse.json(
      { error: 'answers의 각 값은 0~3 사이의 정수여야 합니다.' },
      { status: 400 }
    );
  }

  try {
    const profile = buildProfile(answers);
    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.error('[diagnose] buildProfile 실패:', err);
    return NextResponse.json({ error: '진단 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
