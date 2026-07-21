import assert from 'node:assert/strict';

import { maskPII } from './mask';

const source = [
  '연락처 010-1234-5678',
  '주민번호 900101-1234567',
  '계좌 123-456789-012',
  '이메일 user@example.com',
].join('\n');

const expected = [
  '연락처 [연락처]',
  '주민번호 [주민번호]',
  '계좌 [계좌번호]',
  '이메일 [이메일]',
].join('\n');

assert.equal(maskPII(source), expected);
assert.equal(maskPII(source), expected, '반복 호출에서도 모든 전역 정규식이 동작해야 합니다.');
assert.equal(maskPII('민감정보가 없는 계약 조항입니다.'), '민감정보가 없는 계약 조항입니다.');
assert.equal(maskPII('01012345678 / 010 9876 5432'), '[연락처] / [연락처]');

// ★회귀 방지: 계좌번호 규칙이 날짜를 삼키면 안 됩니다.
//   과거 `2024-10-31`이 [계좌번호]로 마스킹돼 계약기간이 AI에 닿기 전에 사라졌습니다.
//   판독에 필요한 정보를 가리는 것은 과잉 마스킹이며 판정 품질을 직접 훼손합니다.
assert.equal(
  maskPII('계약기간 2024-10-31 부터 2026-10-30 까지'),
  '계약기간 2024-10-31 부터 2026-10-30 까지',
  '날짜는 마스킹되면 안 됩니다',
);
assert.equal(
  maskPII('임대차 기간은 2024년 10월 31일부터 24개월로 한다.'),
  '임대차 기간은 2024년 10월 31일부터 24개월로 한다.',
  '한글 날짜 표기도 보존되어야 합니다',
);
assert.equal(
  maskPII('보증금 300,000,000원 월세 1,500,000원'),
  '보증금 300,000,000원 월세 1,500,000원',
  '금액은 마스킹되면 안 됩니다',
);

// 계좌번호는 계좌 문맥이 있을 때 가립니다.
assert.match(maskPII('입금계좌 110-123-456789'), /\[계좌번호\]/);
assert.match(maskPII('예금주 홍길동 계좌 352-0123-4567-89'), /\[계좌번호\]/);

// 날짜와 계좌가 같이 있어도 각각 올바르게 처리되어야 합니다.
{
  const mixed = maskPII('계약일 2024-10-31, 입금계좌 110-123-456789 입니다.');
  assert.ok(mixed.includes('2024-10-31'), '날짜 보존 실패');
  assert.ok(mixed.includes('[계좌번호]'), '계좌 마스킹 실패');
}

console.log('maskPII checks passed');
