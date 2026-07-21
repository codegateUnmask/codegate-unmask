// ============================================================
// unmask 설정 — 하드코딩 값은 전부 여기에 모읍니다.
//
// 해커톤에서 하드코딩은 허용하되, 한 곳에 모아야
// 나중에 바꿀 때 이 파일만 보면 됩니다. (리팩터링 방지)
// ============================================================

// ------------------------------------------------------------
// 모델 선택 — 2단 분석: 트리아지(Haiku, 빠름) → 정밀(Opus, 데모/발표용)
//
// 💰 비용 메모 (Claude Max 구독과 API 요금은 별개입니다)
//   - Opus 4.8  : 입력 $5 / 출력 $25  (1M 토큰당)  → 계약서 1건 ≈ 90원
//   - Haiku 4.5 : 입력 $1 / 출력 $5   (1M 토큰당)  → 계약서 1건 ≈ 19원
//
//   권장: 개발·테스트는 DEV(Haiku)로 돌리고,
//         데모·발표 직전에 USE_PRODUCTION_MODEL 을 true 로 바꿔 정확도를 올린다.
// ------------------------------------------------------------

/** 데모·발표용으로 정확도 높은 모델을 쓸지 (개발 중에는 false 권장) */
export const USE_PRODUCTION_MODEL = false;

export const MODEL = {
  /** 1단계 트리아지 — 항상 Haiku. SSE로 가장 먼저 흘려보내는 빠른 상위 위험 스캔 */
  triage: 'claude-haiku-4-5',
  /** 2단계 정밀 판독(계약서) — 정확도가 곧 신뢰도라 발표 때는 Opus */
  scan: USE_PRODUCTION_MODEL ? 'claude-opus-4-8' : 'claude-haiku-4-5',
  /** 문자(스미싱) 판독 — 짧고 빈도 높아 저렴한 모델로 충분 */
  message: 'claude-haiku-4-5',
  /** 훈련 문제 생성 (스트레치) */
  train: USE_PRODUCTION_MODEL ? 'claude-opus-4-8' : 'claude-haiku-4-5',
} as const;

/** 응답 길이 상한. 판독 결과 JSON은 그리 길지 않으므로 넉넉히 이 정도면 충분 */
export const MAX_TOKENS = {
  triage: 2000,
  scan: 8000,
  train: 4000,
} as const;

// ------------------------------------------------------------
// 판독 규칙
// ------------------------------------------------------------

/** 계약서 전문을 다 넣지 않습니다. 데모는 핵심 조항 위주 축약 샘플로. */
export const MAX_INPUT_CHARS = 12000;

/** 한 번에 보여줄 최대 발견 항목 수 (너무 많으면 화면이 무너짐) */
export const MAX_FINDINGS = 12;

/** UI 신호등 색상 — 프론트와 백엔드가 같은 의미를 씁니다 */
export const RISK_LABEL = {
  danger: '위험',
  warning: '주의',
  safe: '안전',
} as const;

/**
 * 지식 팩 레지스트리 — 팩 = {과업 분해, 지식 소스, 우선순위}.
 * lib/knowledge/*.ts 가 이 목록과 1:1 대응합니다.
 * terms(약관)는 시간이 밀리면 가장 먼저 뺄 것 (§강등 순서).
 */
export const KNOWLEDGE_PACKS = {
  lease: { label: '전월세 계약서', priority: 1, day: 1 },
  labor: { label: '근로·알바 계약서', priority: 2, day: 2 },
  terms: { label: '약관·독소조항', priority: 3, day: 2 },
  message: { label: '스미싱·피싱 문자 (부가 모드)', priority: 2, day: 2 },
} as const;

// ------------------------------------------------------------
// 보안
// ------------------------------------------------------------

/**
 * 개인정보 마스킹 대상 패턴.
 * LLM에 넘기기 전에 이 값들을 가립니다. (lib/engine/mask.ts)
 */
export const MASK_PATTERNS = {
  phone: /01[016-9][-\s]?\d{3,4}[-\s]?\d{4}/g,
  rrn: /\d{6}[-\s]?[1-4]\d{6}/g, // 주민등록번호
  account: /\d{2,3}[-\s]?\d{2,6}[-\s]?\d{2,6}/g,
  email: /[\w.+-]+@[\w-]+\.[\w.]+/g,
} as const;

/** 마스킹 후 대체 문자열 */
export const MASK_REPLACEMENT = {
  phone: '[연락처]',
  rrn: '[주민번호]',
  account: '[계좌번호]',
  email: '[이메일]',
} as const;

/**
 * ⚠️ 원본 미저장 원칙.
 * 판독이 끝난 원문은 DB에 남기지 않습니다.
 * 저장하지 않은 데이터는 유출될 수 없다 — 암호화보다 강한 보안.
 */
export const STORE_ORIGINAL_TEXT = false;

/**
 * ⚠️ OCR 미사용 원칙.
 * 사진 입력을 OCR API로 외부 전송하지 않습니다 — "원본 외부 반출 없음" 서사와 모순.
 * 입력은 PDF 텍스트 추출 또는 직접 붙여넣기만 지원합니다.
 */
export const USE_OCR = false;

export const USE_MOCK_STREAM = true;
