// ============================================================
// 문서 유형 자동 분류 — [담당: 지식·데이터(D)]
//
// 데모 멘트 "무슨 계약서든 그냥 넣으세요"를 실제로 뒷받침하는 부분입니다.
// 사용자가 탭으로 유형을 고르지 않아도, 본문만 보고 어떤 지식 팩을 장착할지 정합니다.
//
// 2단 구성:
//   1) 키워드 힌트(아래 SIGNALS) — LLM 없이도 후보를 좁히는 값싼 1차 신호
//   2) LLM 분류 프롬프트(ROUTING_PROMPT) — 애매한 경우의 최종 판단
// ============================================================

import type { DocType } from '../types';

/**
 * 유형별 키워드 신호. LLM 호출 전에 후보를 좁히는 용도이며,
 * 이것만으로 단정하지 않습니다(오분류 시 판독 품질이 통째로 흔들리므로).
 */
const SIGNALS: Record<DocType, string[]> = {
  lease: ['임대인', '임차인', '보증금', '전세', '월세', '차임', '전입신고', '확정일자', '등기부', '임대차'],
  labor: ['근로자', '사용자', '사업주', '시급', '월급', '소정근로시간', '주휴', '수습', '연차', '퇴사', '근로계약'],
  service: ['회원권', '이용권', '헬스', '피트니스', 'PT', '필라테스', '피부', '시술', '패키지', '학원', '수강', '중도해지', '환불', '가입비', '등록비', '회차'],
  terms: ['이용약관', '회원가입', '서비스 이용', '청약철회', '자동갱신', '구독', '개인정보 처리', '제3자 제공', '관할법원'],
  message: [
    // 링크·인증 유도형 (기존)
    'http', 'https', '고객님', '안내드립니다', '클릭', '인증번호', '미납', '배송', '조회', '로그인', '계정',
    // 협박·납치 빙자형 — 계약서 어휘와 겹치지 않는 것만 신호로 씀
    '납치', '감금', '데리고 있다', '신고하면', '알리지 마', '입금해', '송금해', '몸값',
  ],
};

/**
 * 긴급 위협 신호 — 판독보다 신고가 급한 경우를 가려냅니다.
 *
 * ⚠️ 오탐 방지: 계약서에도 '협박'·'해지' 같은 단어는 등장하므로 단일 단어로는 판정하지 않고,
 *    서로 다른 범주의 신호가 2개 이상 동시에 나올 때만 긴급으로 봅니다.
 *    (예: "납치" 하나만으로는 부족 — "납치" + "신고하지 마라"처럼 겹쳐야 함)
 */
const THREAT_SIGNALS = {
  /** 신체 억류·위해 */
  harm: ['납치', '감금', '데리고 있다', '데리고있다', '죽인다', '죽여', '해친다', '손가락', '장기를', '팔아넘'],
  /** 신고·주변 차단 — 협박범의 전형적 고립 시도 */
  isolate: ['신고하면', '신고하지 마', '경찰에 알리', '알리지 마', '아무에게도', '혼자 와', '전화 끊지'],
  /** 즉시 금전 요구 — 명령형 어미까지 포함(실측: "5천만원을 보내라"가 안 걸렸음) */
  extort: ['몸값', '지금 즉시 입금', '입금해', '입금하라', '송금해', '송금하라', '계좌로 보내', '원을 보내', '보내라', '시간 안에'],
} as const;

export interface ThreatAssessment {
  /** 긴급 위협으로 판단되는가 (판독 대신 신고 안내를 먼저 노출) */
  isEmergency: boolean;
  /** 어떤 범주의 신호가 잡혔는지 — 사용자에게 근거를 보여줄 때 씁니다 */
  matched: string[];
}

/**
 * 협박·납치 빙자 등 "판독 대상이 아니라 즉시 신고 대상"인 텍스트인지 판정합니다.
 * LLM 호출 없이 동기로 동작합니다.
 */
export function assessThreat(text: string): ThreatAssessment {
  const matched: string[] = [];
  let categories = 0;

  for (const [, words] of Object.entries(THREAT_SIGNALS)) {
    const hits = words.filter((w) => text.includes(w));
    if (hits.length > 0) {
      categories += 1;
      matched.push(...hits);
    }
  }

  return { isEmergency: categories >= 2, matched };
}

/** 1차 힌트: 본문에서 각 유형의 키워드가 몇 개나 등장하는지 세어 후보 순위를 매깁니다. */
export function guessDocType(text: string): { docType: DocType; score: number }[] {
  return (Object.keys(SIGNALS) as DocType[])
    .map((docType) => ({
      docType,
      score: SIGNALS[docType].filter((kw) => text.includes(kw)).length,
    }))
    .sort((a, b) => b.score - a.score);
}

/** 유형 판정을 시도하기에 충분한 길이 (이보다 짧으면 아직 입력 중으로 봄) */
const MIN_TEXT_LENGTH = 20;
/** 다른 유형이 이만큼 더 높으면 "탭을 잘못 골랐다"고 안내 */
const MISMATCH_MARGIN = 2;

export type MatchStatus =
  /** 선택한 유형과 본문이 어울림 */
  | 'ok'
  /** 다른 유형의 신호가 뚜렷하게 강함 — 전환 안내 */
  | 'mismatch'
  /** 어느 유형의 신호도 없음 — 단정하지 않고 넘어감 */
  | 'unknown'
  /** 아직 판단하기엔 너무 짧음 */
  | 'too-short';

export interface DocTypeMatch {
  status: MatchStatus;
  /** mismatch일 때 권하는 유형 */
  suggested: DocType | null;
  /** 긴급 위협 판정 (판독보다 신고가 급한 경우) */
  threat: ThreatAssessment;
}

/**
 * 사용자가 고른 유형과 붙여넣은 본문이 어울리는지 확인합니다.
 *
 * 설계 원칙(2026-07-22 개정) — 신호가 없으면(unknown) 아무 말도 하지 않지만,
 * **다른 유형이 뚜렷하게 우세하면(mismatch) 입력 화면에서 판독을 막고 전환을 안내**합니다.
 * 잘못된 카테고리로 낸 판독 결과는 정확하지 않은데 정확해 보여서, 안내만 하는 것보다
 * 해롭다는 실사용 판단(현찬). 애매한 경우(ok/unknown)는 여전히 막지 않습니다.
 */
export function checkDocTypeMatch(text: string, selected: DocType): DocTypeMatch {
  const threat = assessThreat(text);
  const trimmed = text.trim();

  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { status: 'too-short', suggested: null, threat };
  }

  // 긴급 위협(협박·납치 빙자)은 계약서가 아니라 '문자' 판독 대상입니다.
  // 키워드 점수 마진과 무관하게 문자 유형 전환을 권합니다.
  // (실측: 납치 협박문이 근로계약서 탭에서 마진 1점 차로 'ok' 판정된 사고 방지)
  if (threat.isEmergency && selected !== 'message') {
    return { status: 'mismatch', suggested: 'message', threat };
  }

  const ranked = guessDocType(trimmed);
  const top = ranked[0];
  const selectedScore = ranked.find((r) => r.docType === selected)?.score ?? 0;

  if (top.score === 0) {
    return { status: 'unknown', suggested: null, threat };
  }
  if (top.docType === selected || top.score - selectedScore < MISMATCH_MARGIN) {
    return { status: 'ok', suggested: null, threat };
  }
  return { status: 'mismatch', suggested: top.docType, threat };
}

/**
 * LLM 분류 프롬프트. 트리아지 단계에서 유형을 함께 판정할 때 씁니다.
 * TODO(A): /api/scan 에서 docType이 'auto'로 들어오면 이 프롬프트로 먼저 분류하도록 연결
 */
export const ROUTING_PROMPT = `
다음 문서가 어떤 유형인지 분류하세요. 아래 5가지 중 하나만 고릅니다.

- lease   : 주택 임대차(전세·월세) 계약서. 임대인/임차인, 보증금, 차임이 등장.
- labor   : 근로·아르바이트 계약서. 사용자/근로자, 임금, 소정근로시간이 등장.
- service : 돈을 먼저 내고 나중에 나눠 받는 회원계약.
            헬스장·PT·필라테스·피부과 시술 패키지·학원·어학원 수강계약 등.
            "회원권", "○회권", "중도해지", "환불 규정"이 핵심 신호.
- terms   : 온라인 서비스 이용약관·구독 약관. 불특정 다수에게 동일하게 적용되는 조항.
- message : 계약서가 아니라 문자·메시지 한 통. 스미싱·피싱 판독 대상.

판단 기준:
· service와 terms의 구분 — 특정인이 돈을 내고 기간·횟수만큼 서비스를 받기로 한
  개별 계약이면 service, 불특정 다수에게 적용되는 약관 문서면 terms.
  헬스장 회원가입서는 service입니다(약관 형식이어도).
· lease와 service의 구분 — 주거 목적 임대차면 lease.
· 문서가 아니라 짧은 메시지 한 통이면 message.

확신이 서지 않으면 가장 가능성 높은 것을 고르되, 그 사실을 함께 알리세요.
`;
