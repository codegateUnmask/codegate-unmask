import assert from 'node:assert/strict';
import { consume, RATE_LIMIT, resetRateLimit } from './rateLimit';

resetRateLimit();
const NOW = 1_000_000;

// 한도까지는 통과해야 합니다.
for (let i = 1; i <= RATE_LIMIT.max; i += 1) {
  const r = consume('user-a', NOW);
  assert.equal(r.allowed, true, `${i}번째 요청은 허용되어야 합니다`);
  assert.equal(r.remaining, RATE_LIMIT.max - i);
}

// 한도를 넘으면 막고, 재시도 시각을 알려줘야 합니다.
const blocked = consume('user-a', NOW);
assert.equal(blocked.allowed, false);
assert.equal(blocked.remaining, 0);
assert.ok(blocked.retryAfterSec > 0, '재시도까지 남은 시간을 알려줘야 합니다');

// 사용자별로 독립이어야 합니다 — 한 사람이 다 썼다고 다른 사람이 막히면 안 됩니다.
assert.equal(consume('user-b', NOW).allowed, true);

// 창이 지나면 다시 열려야 합니다.
const afterWindow = NOW + RATE_LIMIT.windowMs + 1;
assert.equal(consume('user-a', afterWindow).allowed, true, '시간이 지나면 초기화되어야 합니다');

// 차단된 요청은 카운트를 더 올리지 않아야 합니다(차단이 창을 연장하면 안 됨).
resetRateLimit();
for (let i = 0; i < RATE_LIMIT.max; i += 1) consume('user-c', NOW);
const first = consume('user-c', NOW).retryAfterSec;
const second = consume('user-c', NOW + 1000).retryAfterSec;
assert.ok(second <= first, '차단이 반복돼도 재시도 시각이 밀리면 안 됩니다');

console.log('rateLimit checks passed');
