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
  account: /\d{2,3}[-\s]?\d{2,6}[-\s]?\d{2,6}/g,
  email: /[\w.+-]+@[\w-]+\.[\w.]+/g,
} as const;

export const MASK_REPLACEMENT = {
  phone: '[연락처]',
  rrn: '[주민번호]',
  account: '[계좌번호]',
  email: '[이메일]',
} as const;

export const STORE_ORIGINAL_TEXT = false;
export const USE_OCR = false;

// 기본은 실제 API. 키 없는 로컬 개발자는 .env.local에 NEXT_PUBLIC_MOCK_STREAM=1
export const USE_MOCK_STREAM = process.env.NEXT_PUBLIC_MOCK_STREAM === '1';
