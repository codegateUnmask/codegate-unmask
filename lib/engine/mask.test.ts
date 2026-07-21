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

console.log('maskPII checks passed');
