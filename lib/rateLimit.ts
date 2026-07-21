// ============================================================
// 판독 요청 제한 — [담당: 지식·데이터·인프라(D)]
//
// 판독 1건마다 실제 AI 비용이 나가므로, 로그인만으로는 부족하고
// "한 사람이 얼마나 자주 쓸 수 있는지"까지 제한해야 합니다.
//
// ⚠️ 한계를 분명히 해둡니다: 이 구현은 **서버 인스턴스 메모리 기준**입니다.
//    서버리스는 인스턴스가 여러 개 뜰 수 있어 완벽한 전역 제한이 아닙니다.
//    (정확한 전역 제한은 Redis 같은 공용 저장소가 필요 — 해커톤 범위 밖)
//    그래도 로그인 요구 + 이 제한을 함께 두면 단순 남용은 실질적으로 막힙니다.
// ============================================================

/** 창(window) 안에서 허용할 요청 수 */
export const RATE_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 } as const;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** 오래된 항목이 무한히 쌓이지 않도록 정리 */
function sweep(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** 다시 시도 가능해질 때까지 남은 초 */
  retryAfterSec: number;
}

/**
 * 키(보통 로그인 사용자 식별자) 기준으로 요청을 허용할지 판단합니다.
 * 허용되는 경우에만 카운트를 올립니다.
 */
export function consume(key: string, now: number = Date.now()): RateLimitResult {
  sweep(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.max - 1, retryAfterSec: 0 };
  }

  if (bucket.count >= RATE_LIMIT.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT.max - bucket.count,
    retryAfterSec: 0,
  };
}

/** 테스트용 — 상태 초기화 */
export function resetRateLimit(): void {
  buckets.clear();
}
