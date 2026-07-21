import assert from 'node:assert/strict';
import { assessOcrLines, isCriticalContractLine } from './ocr-confidence';
import { assessImageQuality, readImageQualityPolicy } from './ocr-quality';

assert.equal(isCriticalContractLine('보증금은 30,000,000원입니다.'), true);
assert.equal(isCriticalContractLine('계약기간 2026.01.01부터 2027.01.01까지'), true);
assert.equal(isCriticalContractLine('일반 안내 문구입니다.'), false);

const assessment = assessOcrLines(
  [
    { text: '보증금 30,000,000원', score: 0.98 },
    { text: '계좌번호 123-456-789012', score: 0.72 },
    { text: '일반 안내', score: 0.99 },
  ],
  '0.85',
);

assert.equal(assessment.lines.filter(({ critical }) => critical).length, 2);
assert.deepEqual(assessment.lines.filter(({ lowConfidence }) => lowConfidence).map(({ text }) => text), [
  '계좌번호 123-456-789012',
]);
assert.equal(assessment.text.includes('일반 안내'), true);

const invalidConfidence = assessOcrLines([{ text: '자동 갱신 조항', score: Number.NaN }]);
assert.equal(invalidConfidence.lines.filter(({ lowConfidence }) => lowConfidence).length, 1);

assert.deepEqual(readImageQualityPolicy(undefined, undefined), {
  minShortSide: 720,
  minBlurScore: 0.0005,
});
assert.equal(readImageQualityPolicy('0', '0.02'), null);

const policy = readImageQualityPolicy('1000', '0.02');
assert.deepEqual(policy, { minShortSide: 1000, minBlurScore: 0.02 });
const rejected = assessImageQuality({ shortSide: 800, blurScore: 0.01 }, policy);
assert.equal(rejected.decision, 'recapture');
if (rejected.decision !== 'recapture') throw new Error('Expected recapture decision');
assert.deepEqual(rejected.reasons, [
  'too-small',
  'blurry',
]);
assert.equal(assessImageQuality({ shortSide: 1200, blurScore: 0.03 }, policy).decision, 'pass');
assert.equal(assessImageQuality({ shortSide: 1200, blurScore: 0.03 }, null).decision, 'review-required');

const defaultPolicy = readImageQualityPolicy();
assert.equal(assessImageQuality({ shortSide: 900, blurScore: 0.00103 }, defaultPolicy).decision, 'pass');
assert.equal(assessImageQuality({ shortSide: 900, blurScore: 0.000002 }, defaultPolicy).decision, 'recapture');

assert.throws(() => assessOcrLines([], '0.85'), /텍스트를 찾지 못했습니다/);

console.log('OCR gate tests passed');
