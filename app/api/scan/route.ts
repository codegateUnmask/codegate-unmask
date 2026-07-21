import { auth } from '@/auth';
import { consume, RATE_LIMIT } from '@/lib/rateLimit';
import { createScanHandler } from './handler';

export const runtime = 'nodejs';

// 판독은 triage + 정밀 2단계라 실측 20~37초가 걸립니다(로컬·프로덕션 동일).
// 플랫폼 기본 타임아웃에 기대면 배포 환경 설정이 바뀔 때 조용히 끊기므로 명시합니다.
export const maxDuration = 120;

const handleScan = createScanHandler({
  runTriage: async (...args) => {
    const { runTriage } = await import('../../../lib/engine/triage');
    return runTriage(...args);
  },
  analyzeDocument: async (...args) => {
    const { analyzeDocument } = await import('../../../lib/engine/analyze');
    return analyzeDocument(...args);
  },
});

/**
 * 판독 요청은 로그인 + 사용량 제한을 통과해야 합니다.
 * 미들웨어에서도 로그인을 확인하지만, 라우트에서 한 번 더 봅니다
 * (미들웨어 설정이 바뀌어도 API가 열리지 않도록 — 방어를 한 겹에 의존하지 않음).
 */
export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  const userId = session?.user?.email ?? session?.user?.name;
  if (!userId) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const limit = consume(`scan:${userId}`);
  if (!limit.allowed) {
    return Response.json(
      {
        error: `판독은 시간당 ${RATE_LIMIT.max}건까지 이용할 수 있어요. 잠시 후 다시 시도해 주세요.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfterSec),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  return handleScan(request);
}
