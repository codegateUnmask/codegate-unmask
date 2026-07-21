import { createScanHandler } from './handler';

export const runtime = 'nodejs';

// 판독은 triage + 정밀 2단계라 실측 20~37초가 걸립니다(로컬·프로덕션 동일).
// 플랫폼 기본 타임아웃에 기대면 배포 환경 설정이 바뀔 때 조용히 끊기므로 명시합니다.
export const maxDuration = 120;

export const POST = createScanHandler({
  runTriage: async (...args) => {
    const { runTriage } = await import('../../../lib/engine/triage');
    return runTriage(...args);
  },
  analyzeDocument: async (...args) => {
    const { analyzeDocument } = await import('../../../lib/engine/analyze');
    return analyzeDocument(...args);
  },
});
