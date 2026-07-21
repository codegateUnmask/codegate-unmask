export const MAX_TOKENS = {
  triage: 2000,
  scan: 8000,
  train: 4000,
} as const;

export const MAX_INPUT_CHARS = 12000;
export const MAX_FINDINGS = 12;

export const RISK_LABEL = {
  danger: '위험',
  warning: '주의',
  safe: '안전',
} as const;

export const KNOWLEDGE_PACKS = {
  lease: { label: '전월세 계약서', priority: 1, day: 1 },
  labor: { label: '근로·알바 계약서', priority: 2, day: 1 },
  service: { label: '헬스장·피부과·학원 회원계약', priority: 2, day: 1 },
  terms: { label: '온라인 서비스 약관·구독', priority: 3, day: 2 },
  message: { label: '스미싱·피싱 문자 (부가 모드)', priority: 3, day: 2 },
} as const;

export const MASK_PATTERNS = {
  phone: /01[016-9][-\s]?\d{3,4}[-\s]?\d{4}/g,
  rrn: /\d{6}[-\s]?[1-4]\d{6}/g,
  // ⚠️ 계좌번호는 "숫자-숫자-숫자" 모양만으로 잡으면 날짜(2024-10-31)까지 삼킵니다.
  //    실제로 계약기간이 [계좌번호]로 마스킹돼 AI가 기간 조항을 볼 수 없었습니다.
  //    그래서 ① 날짜로 보이는 것은 먼저 제외하고 ② 계좌 문맥 단어가 앞에 있을 때만 가립니다.
  account:
    /(?<=(?:계좌|예금주|입금|송금|이체)[^\n]{0,20})\b\d{2,3}[-\s]?\d{2,6}[-\s]?\d{2,6}\b/g,
  email: /[\w.+-]+@[\w-]+\.[\w.]+/g,
} as const;

/** 날짜로 해석되는 표기 — 계좌번호 마스킹에서 제외하기 위한 판별용 */
export const DATE_LIKE = /\b(?:19|20)\d{2}\s*[-./년]\s*\d{1,2}\s*[-./월]\s*\d{1,2}/g;

export const MASK_REPLACEMENT = {
  phone: '[연락처]',
  rrn: '[주민번호]',
  account: '[계좌번호]',
  email: '[이메일]',
} as const;

export const STORE_ORIGINAL_TEXT = false;
export const USE_OCR = true;

export const USE_MOCK_STREAM = process.env.NEXT_PUBLIC_MOCK_STREAM === '1';
