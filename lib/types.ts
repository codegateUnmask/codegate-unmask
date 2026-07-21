// ============================================================
// unmask 공용 타입 — 팀 전체가 이 파일을 기준으로 작업합니다.
//
// ⚠️ 이 파일은 코어 엔진 오너(A)만 수정합니다.
//    나머지는 import만 하세요. 타입이 바뀌면 팀 전체에 알릴 것.
//
// 📢 CHANGELOG (진단 파트 담당자 수정)
//    - VulnProfile 에 mbtiMatch / characterTitle / category / strengths 추가
//    - 기존 필드(typeCode, typeName, tagline, axes, description, weakAgainst,
//      createdAt)는 전혀 변경하지 않았습니다 → mock.ts, 판독(B) 쪽 코드 그대로 호환됩니다.
//    - 새 필드는 전부 optional(?) 이라 기존 MOCK_PROFILE 도 타입 에러 없이 동작합니다.
//    - 다만 /app/diagnose 화면은 새 필드를 렌더링하므로, 실제 진단 API 응답에는
//      항상 채워서 반환합니다 (profileTypes.ts 참고).
// ============================================================

/** 위험 등급 — UI 신호등 3색과 1:1 대응 */
export type RiskLevel = 'danger' | 'warning' | 'safe';

/** 분석 대상 종류 — /lib/knowledge 의 지식 모듈과 1:1 대응 */
export type DocType = 'lease' | 'labor' | 'message';

// ------------------------------------------------------------
// 진단 (데모 컷1)
// ------------------------------------------------------------

/** 사기 취약성 4축 (0~100). verify만 높을수록 안전한 역방향 축 */
export interface VulnAxes {
  /** 권위 반응 — 높을수록 기관·회사 사칭에 취약 */
  authority: number;
  /** 시간 압박 반응 — 높을수록 "지금 당장"에 취약 */
  urgency: number;
  /** 이득 유혹 반응 — 높을수록 고수익·환급 미끼에 취약 */
  greed: number;
  /** 검증 습관 — 높을수록 안전 (역방향 축) */
  verify: number;
}

/** 유형 대분류 — 취약형(사기에 약함) vs 방어형(철옹성) */
export type ProfileCategory = 'vulnerable' | 'defensive';

/** 진단 결과 = 사용자의 사기 취약(또는 방어) 유형 */
export interface VulnProfile {
  /** 유형 코드 (예: 'AUTHORITY_DOMINANT', 'FORTRESS') */
  typeCode: string;
  /** 유형 이름 (예: '권위 앞에 약해지는 형') */
  typeName: string;
  /** 공유하고 싶어지는 한 줄 (결과 카드 헤드라인) */
  tagline: string;
  axes: VulnAxes;
  /** 유형 설명 2~3문장 */
  description: string;
  /** 특히 취약한 수법 목록 (취약형에서 주로 사용) */
  weakAgainst: string[];
  /** ISO 8601 */
  createdAt: string;

  // -------------------- 확장 필드 (신규) --------------------
  /** MBTI 페르소나 매칭 (예: 'ISTJ') */
  mbtiMatch?: string;
  /** 힙한 캐릭터 타이틀 (예: '강철 방패 수호자') */
  characterTitle?: string;
  /** 취약형인지 방어형인지 */
  category?: ProfileCategory;
  /** 특히 강한 방어 포인트 목록 (방어형에서 주로 사용) */
  strengths?: string[];
}

/** 진단 문항 */
export interface Question {
  id: string;
  /** 이 문항이 측정하는 축 */
  axis: keyof VulnAxes;
  text: string;
  options: { label: string; score: number }[];
}

// ------------------------------------------------------------
// 판독 (데모 컷2) — 코어
// ------------------------------------------------------------

/**
 * 판독 결과의 개별 발견 항목.
 * ★ quote 는 필수입니다. 원문 근거가 없으면 이 항목을 만들지 않습니다.
 *   (= 환각 차단. 근거 없는 위험은 화면에 띄우지 않는다)
 */
export interface Finding {
  id: string;
  level: RiskLevel;
  /** 조항 제목이 있으면 (예: '제7조 원상복구') */
  clauseTitle?: string;
  /** ★필수★ 원문에서 그대로 인용 — 프론트가 이 문자열로 하이라이트합니다 */
  quote: string;
  /** 왜 이 등급인지 — 중학생도 이해할 쉬운 말로 */
  reason: string;
  /** 지금 무엇을 해야 하는지 */
  action?: string;
  /** 근거 법령 — 확실할 때만. 불확실하면 넣지 않습니다 */
  legalBasis?: string;
}

/** 판독 API 응답 */
export interface ScanResult {
  docType: DocType;
  /** 문서 전체의 최고 위험도 */
  overallLevel: RiskLevel;
  /** 한 줄 요약 */
  summary: string;
  /** 위험 → 주의 → 안전 순으로 정렬해서 반환 */
  findings: Finding[];
  /** 사용자 유형 맞춤 한마디 (데모 컷3) */
  personalized?: string;
  /** ISO 8601 */
  scannedAt: string;
}

// ------------------------------------------------------------
// API 요청 계약
// ------------------------------------------------------------

/** POST /api/scan */
export interface ScanRequest {
  text: string;
  docType: DocType;
  /** 있으면 유형 맞춤 설명을 생성합니다 */
  profile?: VulnProfile;
}

/** POST /api/diagnose */
export interface DiagnoseRequest {
  /** questions.ts 의 문항 순서대로 선택한 score 배열 */
  answers: number[];
}
