// ============================================================
// 근거 검증 — [담당: 코어 오너(A)]
// quote가 원문에 실제로 존재하지 않는 finding은 버립니다.
// = 환각 차단의 마지막 관문. LLM이 quote를 지어냈어도 여기서 걸러집니다.
// ============================================================

import type { Finding } from '../types';
import { MAX_FINDINGS } from '../config';

/**
 * 원문(sourceText)에 실제로 등장하지 않는 quote를 가진 finding은 제거합니다.
 * 공백·줄바꿈 차이는 관대하게 봐주되(정규화 비교), 내용 자체가 없으면 버립니다.
 */
export function verifyFindings(findings: Finding[], sourceText: string): Finding[] {
  const normalize = (s: string) => s.replace(/\s+/g, '');
  const normalizedSource = normalize(sourceText);

  return findings
    .filter((f) => f.quote && normalizedSource.includes(normalize(f.quote)))
    .slice(0, MAX_FINDINGS);
}

/** 위험 → 주의 → 안전 순으로 정렬 */
export function sortFindingsByRisk(findings: Finding[]): Finding[] {
  const order = { danger: 0, warning: 1, safe: 2 } as const;
  return [...findings].sort((a, b) => order[a.level] - order[b.level]);
}
