// ============================================================
// unmask 공용 타입 — 팀 전체가 이 파일을 기준으로 작업합니다.
//
// ⚠️ 이 파일은 코어 엔진 오너(A)만 수정합니다.
//    나머지는 import만 하세요. 타입이 바뀌면 팀 전체에 알릴 것.
//
// 이 계약이 있으면 프론트는 API 완성을 기다리지 않고
// 목업(lib/mock.ts)으로 화면을 먼저 만들 수 있고, 나중에 그대로 붙습니다.
// ============================================================

/** 위험 등급 — UI 신호등 3색과 1:1 대응 */
export type RiskLevel = 'danger' | 'warning' | 'safe';

/** 분석 대상 종류 — /lib/knowledge 의 지식 팩과 1:1 대응. terms는 스트레치 */
export type DocType = 'lease' | 'labor' | 'terms' | 'message';

/** SSE 분석 단계 — 트리아지(Haiku, 빠름) 먼저, 정밀(Opus)이 이어붙음 */
export type AnalysisStage = 'triage' | 'full';

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

/** 진단 결과 = 사용자의 사기 취약 유형 */
export interface VulnProfile {
  /** 유형 코드 (예: 'AUTHORITY_DOMINANT') */
  typeCode: string;
  /** 유형 이름 (예: '권위 앞에 약해지는 형') */
  typeName: string;
  /** 공유하고 싶어지는 한 줄 (결과 카드 헤드라인) */
  tagline: string;
  axes: VulnAxes;
  /** 유형 설명 2~3문장 */
  description: string;
  /** 특히 취약한 수법 목록 (예: ['기관 사칭 문자', '전세 특약 함정']) */
  weakAgainst: string[];
  /** ISO 8601 */
  createdAt: string;
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
 * 판독 결과의 개별 발견 항목 (조항 단위 신호등).
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
  /** 왜 이 등급인지 — 중학생도 이해할 쉬운 말로 (1차 응답, 짧게) */
  reason: string;
  /** "왜요?" 클릭 시 보여줄 상세 설명 (온디맨드 — 1차 응답 속도를 위해 분리) */
  detailedReason?: string;
  /** 지금 무엇을 해야 하는지 (예: '이 조항 삭제를 요구하세요') */
  action?: string;
  /** 근거 법령 — 확실할 때만. 불확실하면 넣지 않습니다 */
  legalBasis?: string;
}

/**
 * 판독 API 응답 (7항목 리포트 프레임).
 * findings(조항별 신호등)는 화면의 핵심이고, 그 위에 종합 리포트 구조를 얹은 것.
 * 종합(summary)은 "판정"이 아니라 "조건부 상태"로 쓸 것:
 *   예) "지금 상태로는 서명을 권하지 않음. 아래 2개가 해소되면 위험 감소."
 * (법률 자문 경계 원칙과 정합 — 우리는 예/아니오를 선고하지 않는다)
 */
export interface ScanResult {
  docType: DocType;
  /** 문서 전체의 최고 위험도 */
  overallLevel: RiskLevel;
  /** 한 줄 요약 (조건부 상태 문장) */
  summary: string;
  /** 위험 → 주의 → 안전 순으로 정렬해서 반환 */
  findings: Finding[];
  /** 빠진 서류 (예: '등기부등본', '위임장·인감증명서') */
  missingDocuments: string[];
  /** 이 문서만으로는 확인 불가능한 항목 (예: '실제 등기상 소유자 일치 여부') */
  unverifiable: string[];
  /** 계약 전에 상대방(중개사/사장님 등)에게 요청할 문구 */
  requestPhrases: string[];
  /** 공식 확인 경로 (예: '인터넷등기소', '고용노동부 1350') */
  officialChannels: string[];
  /** 전문가 검토가 필요한 부분 */
  needsExpertReview: string[];
  /** 사용자 유형 맞춤 한마디 (데모 컷3, VulnProfile을 넘겼을 때만) */
  personalized?: string;
  /** ISO 8601 */
  scannedAt: string;
}

/** /api/scan SSE 스트림 이벤트 — stage:'triage' 1번 → stage:'full' 1번 순서로 온다 */
export interface ScanStreamEvent {
  stage: AnalysisStage;
  result: ScanResult;
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
