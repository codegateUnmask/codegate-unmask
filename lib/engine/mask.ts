// ============================================================
// 개인정보 마스킹 — [담당: 코어 오너(A)]
// 외부 모델로 넘기기 전, 정규식으로 식별 가능한 민감정보를 가립니다.
// ============================================================

import { MASK_PATTERNS, MASK_REPLACEMENT } from '../config';

// 전화번호·주민번호를 더 일반적인 계좌 패턴보다 먼저 처리합니다.
const MASK_ORDER = ['phone', 'rrn', 'account', 'email'] as const;

/** 텍스트에서 지원하는 민감정보 패턴을 모두 마스킹합니다. */
export function maskPII(text: string): string {
  let masked = text;
  for (const key of MASK_ORDER) {
    masked = masked.replace(MASK_PATTERNS[key], MASK_REPLACEMENT[key]);
  }
  return masked;
}
