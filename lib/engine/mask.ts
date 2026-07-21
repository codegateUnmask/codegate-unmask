// ============================================================
// 개인정보 마스킹 — [담당: 코어 오너(A)]
// Claude API로 넘기기 전, 이름·연락처·계좌·주민번호를 가립니다.
// ============================================================

import { MASK_PATTERNS, MASK_REPLACEMENT } from '../config';

/**
 * 텍스트에서 개인정보 패턴을 찾아 마스킹합니다.
 * TODO(A): 이름 마스킹(정규식만으로는 어려움 — 흔한 성씨 사전 or NER 검토) 추가
 */
export function maskPII(text: string): string {
  let masked = text;
  for (const key of Object.keys(MASK_PATTERNS) as (keyof typeof MASK_PATTERNS)[]) {
    masked = masked.replace(MASK_PATTERNS[key], MASK_REPLACEMENT[key]);
  }
  return masked;
}
