import { DATE_LIKE, MASK_PATTERNS, MASK_REPLACEMENT } from '../config';

// 순서 주의: 주민번호를 연락처보다 먼저 처리하면 앞 6자리가 잘려나갑니다.
// 이름·주소는 숫자 규칙과 겹치지 않으므로 마지막에 처리합니다.
const MASK_ORDER = ['phone', 'rrn', 'account', 'email', 'name', 'addressDetail'] as const;

/**
 * 날짜 자리표시자. 마스킹 규칙(특히 계좌번호)이 자리표시자 자체를 다시 삼키지 않도록
 * 숫자를 쓰지 않고, 일반 문서에 나올 일 없는 제어 문자로 감쌉니다.
 */
const DATE_MARK = '␟';

/**
 * 개인정보 마스킹. 판독은 항상 이 결과만 외부로 보냅니다.
 *
 * ⚠️ 마스킹은 "많이 가릴수록 좋다"가 아닙니다.
 *    계약기간처럼 판독에 꼭 필요한 정보까지 가리면 판독 자체가 틀어집니다.
 *    실제로 계좌번호 규칙이 `2024-10-31`을 삼켜 계약기간이 사라진 적이 있어,
 *    날짜는 먼저 보호한 뒤 되돌립니다.
 */
export function maskPII(text: string): string {
  // 1) 날짜를 순서대로 빼두고 자리표시자로 바꾼다 (계좌번호 규칙의 오탐 방지)
  const dates: string[] = [];
  let masked = text.replace(DATE_LIKE, (m) => {
    dates.push(m);
    return DATE_MARK;
  });

  // 2) 민감정보 마스킹
  for (const key of MASK_ORDER) {
    masked = masked.replace(MASK_PATTERNS[key], MASK_REPLACEMENT[key]);
  }

  // 3) 날짜를 원래 순서대로 되돌린다
  let i = 0;
  return masked.replace(new RegExp(DATE_MARK, 'g'), () => dates[i++] ?? '');
}
