import assert from 'node:assert/strict';
import { MAX_FINDINGS } from '../config';
import type { Finding } from '../types';
import { sortFindingsByRisk, verifyFindings } from './citation';

function finding(id: string, level: Finding['level'], quote: string): Finding {
  return {
    id,
    level,
    quote,
    reason: `${id} reason`,
    action: `${id} action`,
  };
}

const sourceText = '보증금은 1억 원입니다. 임대인 연락처는 [연락처]입니다.';
const valid: Finding = {
  ...finding('valid', 'warning', '보증금은 1억 원입니다.'),
  clauseTitle: '보증금',
  detailedReason: 'valid detail',
  legalBasis: 'valid basis',
};
const masked = finding('masked', 'safe', '[연락처]');
const verified = verifyFindings(
  [
    valid,
    masked,
    finding('empty', 'danger', ''),
    finding('blank', 'danger', '   '),
    finding('fabricated', 'danger', '위약금은 50%입니다.'),
    finding('not-exact', 'danger', '보증금은\n1억 원입니다.'),
    finding('unmasked', 'danger', '010-1234-5678'),
  ],
  sourceText,
);

assert.deepEqual(verified, [valid, masked]);
assert.deepEqual(verified[0], valid);

const unordered = [
  ...Array.from({ length: MAX_FINDINGS }, (_, index) =>
    finding(`safe-${index}`, 'safe', `safe-${index}`),
  ),
  finding('warning', 'warning', 'warning'),
  finding('danger', 'danger', 'danger'),
];
const sorted = sortFindingsByRisk(
  verifyFindings(unordered, unordered.map(({ quote }) => quote).join('\n')),
);

assert.equal(sorted.length, MAX_FINDINGS);
assert.deepEqual(
  sorted.slice(0, 2).map(({ id }) => id),
  ['danger', 'warning'],
);
assert.equal(unordered[0].id, 'safe-0');

console.log('citation tests passed');
