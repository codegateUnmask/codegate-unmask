// ============================================================
// 유형 정의 데이터 — MBTI 16유형 전체를 1:1로 매칭
//
// 4축(authority/urgency/greed/verify)을 각각 고(1)/저(0)로 나누면
// 2^4 = 16가지 조합이 나옵니다. scoring.ts 의 determineType() 이
// 이 조합을 typeCode(=MBTI 코드)로 변환하고, 이 파일의 key와 매칭합니다.
//
// verify=1(검증습관 높음) → 방어형(defensive) 8종
// verify=0(검증습관 낮음) → 취약형(vulnerable) 8종
//
// characterAccessories: 이 유형에서 "값이 높은(1)" 축 목록.
// TypeCharacter 컴포넌트가 이 배열을 보고 캐릭터에 배지를 그립니다.
// (취약형은 약점 배지, 방어형은 강점/보유특성 배지로 표시)
// ============================================================

import type { ProfileCategory, VulnAxes } from '../types';

export interface ProfileTypeDef {
  typeCode: string;
  typeName: string;
  tagline: string;
  description: string;
  /** 취약형: 특히 취약한 수법. 방어형: 남아있는 약점(있다면) */
  weakAgainst: string[];
  /** 방어형: 특히 강한 방어 포인트. 취약형: 빈 배열 */
  strengths: string[];
  mbtiMatch: string;
  characterTitle: string;
  category: ProfileCategory;
  /** 캐릭터 배지로 표시할, 값이 높은(1) 축들 */
  characterAccessories: (keyof VulnAxes)[];
}

export const PROFILE_TYPES: Record<string, ProfileTypeDef> = {
  // ================= 취약형 8종 (verify = 0) =================
  INFP: {
    typeCode: 'INFP',
    typeName: '무기력 방관자형',
    tagline: '위험 신호도, 확인할 마음도 딱히 없는 당신',
    description:
      '권위·시간압박·이득 어느 자극에도 크게 반응하지 않지만, 확인하고 검증하는 습관 자체가 거의 없는 유형입니다. 특별히 흥분하지 않는 대신 그냥 넘어가는 경우가 많아, 여러 수법에 고르게 노출됩니다.',
    weakAgainst: ['확인 없이 그냥 넘어가는 서류·문자', '무심코 누르는 낯선 링크', '대충 훑고 넘기는 계약 조항'],
    strengths: [],
    mbtiMatch: 'INFP',
    characterTitle: '몽상 속 방관자',
    category: 'vulnerable',
    characterAccessories: [],
  },
  ENFP: {
    typeCode: 'ENFP',
    typeName: '황금빛 미끼에 끌리는 형',
    tagline: '"공짜 or 대박"이라는 말에 눈이 반짝이는 당신',
    description:
      '이득 앞에서 판단력이 흐려지는 유형입니다. 원금 보장, 고수익, 세금 환급처럼 달콤한 제안에 먼저 반응해 리딩방·환급 사기·초저가 미끼형 수법에 취약합니다.',
    weakAgainst: ['원금 보장 고수익 투자 리딩방', '세금 환급 링크', '시세보다 지나치게 싼 매물'],
    strengths: [],
    mbtiMatch: 'ENFP',
    characterTitle: '황금빛 나침반 분실자',
    category: 'vulnerable',
    characterAccessories: ['greed'],
  },
  ESFP: {
    typeCode: 'ESFP',
    typeName: '카운트다운에 흔들리는 형',
    tagline: '"지금 아니면 늦는다"는 말에 심장이 먼저 뛰는 당신',
    description:
      '시간이 없다는 압박이 들어오면 판단력보다 조급함이 앞서는 유형입니다. 마감·긴급·정지 같은 단어가 등장하는 순간 확인 절차를 건너뛰기 쉬워 급전 요구형 사기에 취약합니다.',
    weakAgainst: ['계좌 정지 임박 문자', '가족 사칭 급전 요청', '한정 시간 투자 권유'],
    strengths: [],
    mbtiMatch: 'ESFP',
    characterTitle: '카운트다운 술래',
    category: 'vulnerable',
    characterAccessories: ['urgency'],
  },
  ESTP: {
    typeCode: 'ESTP',
    typeName: '질주하는 한탕형',
    tagline: '급할수록, 이득이 클수록 더 몸이 먼저 나가는 당신',
    description:
      '시간 압박과 이득 유혹이 겹치면 특히 취약해지는 유형입니다. "지금 아니면 못 산다"는 한정 특가와 조급함이 결합된 수법에 쉽게 걸려듭니다.',
    weakAgainst: ['한정 시간 초특가 판매', '마감 임박 투자 이벤트', '재촉과 미끼가 동시에 오는 문자'],
    strengths: [],
    mbtiMatch: 'ESTP',
    characterTitle: '질주하는 한탕주의자',
    category: 'vulnerable',
    characterAccessories: ['urgency', 'greed'],
  },
  ISFJ: {
    typeCode: 'ISFJ',
    typeName: '권위 앞에 약해지는 형',
    tagline: '"기관에서 왔다"는 말 한마디에 마음이 놓이는 당신',
    description:
      '공공기관·은행·회사 이름이 붙으면 의심의 문턱이 크게 낮아지는 유형입니다. 상대가 근거를 대지 않아도 직함이나 기관명만으로 신뢰하는 경향이 있어 사칭형 수법에 특히 취약합니다.',
    weakAgainst: ['기관 사칭 전화·문자', '중개사·집주인의 구두 약속', '직급을 앞세운 지시'],
    strengths: [],
    mbtiMatch: 'ISFJ',
    characterTitle: '완장 앞의 순정파',
    category: 'vulnerable',
    characterAccessories: ['authority'],
  },
  ESFJ: {
    typeCode: 'ESFJ',
    typeName: '충성과 욕심 사이형',
    tagline: '기관 말도 믿고, 좋은 제안도 믿는, 두루두루 믿는 당신',
    description:
      '권위 있는 상대의 말과 이득이 되는 제안 모두에 쉽게 마음이 기우는 유형입니다. "기관에서 제공하는 특별 혜택" 같은 결합형 수법에 특히 취약합니다.',
    weakAgainst: ['기관 명의의 특별 혜택 안내', '직급 높은 사람의 투자 추천', '공식 행사처럼 포장된 환급 이벤트'],
    strengths: [],
    mbtiMatch: 'ESFJ',
    characterTitle: '충성과 욕심 사이',
    category: 'vulnerable',
    characterAccessories: ['authority', 'greed'],
  },
  ENFJ: {
    typeCode: 'ENFJ',
    typeName: '다급한 순응자형',
    tagline: '높은 사람이 급하다고 하면 두 번 생각할 틈이 없는 당신',
    description:
      '권위와 시간 압박이 겹치면 특히 흔들리는 유형입니다. "대표님이 지금 급하게"처럼 직급과 조급함이 함께 오는 수법에 쉽게 반응합니다.',
    weakAgainst: ['상사·대표 사칭 긴급 지시', '기관의 마감 임박 통보', '재촉하는 상급자 사칭 메시지'],
    strengths: [],
    mbtiMatch: 'ENFJ',
    characterTitle: '재촉엔 약한 조력자',
    category: 'vulnerable',
    characterAccessories: ['authority', 'urgency'],
  },
  ISFP: {
    typeCode: 'ISFP',
    typeName: '총체적 무방비형',
    tagline: '권위에도, 시간에도, 이득에도 다 마음이 흔들리는 당신',
    description:
      '권위·시간압박·이득 세 가지 자극 모두에 반응이 높고 검증 습관도 약한 유형입니다. 특정 수법 하나가 아니라 거의 모든 유형의 사기에 고르게 노출되어 있어 가장 종합적인 주의가 필요합니다.',
    weakAgainst: ['기관 사칭', '급전 요청', '고수익 미끼', '낯선 링크'],
    strengths: [],
    mbtiMatch: 'ISFP',
    characterTitle: '만능 무방비 몽상가',
    category: 'vulnerable',
    characterAccessories: ['authority', 'urgency', 'greed'],
  },

  // ================= 방어형 8종 (verify = 1) =================
  ISTJ: {
    typeCode: 'ISTJ',
    typeName: '철옹성 균형 수호자형',
    tagline: '어느 쪽으로도 기울지 않는, 흔들림 없는 균형의 소유자',
    description:
      '권위·시간압박·이득 어느 자극에도 고르게 낮은 반응을 보이면서 검증 습관은 확실한 유형입니다. 특정 약점이 없어 사기꾼 입장에서 가장 공략하기 어려운 상대이며, 침착함과 꼼꼼함을 동시에 갖췄습니다.',
    weakAgainst: ['너무 신중해 좋은 기회도 신중히 살피느라 늦게 잡을 수 있음'],
    strengths: ['모든 유형의 압박에 균형 잡힌 대응', '감정에 휘둘리지 않는 판단력', '주변에 사기 경보를 잘 알려주는 편'],
    mbtiMatch: 'ISTJ',
    characterTitle: '강철 방패 수호자',
    category: 'defensive',
    characterAccessories: ['verify'],
  },
  ENTJ: {
    typeCode: 'ENTJ',
    typeName: '야망과 냉정 사이형',
    tagline: '대부분 냉철하지만, 큰 수익 앞에서는 살짝 눈이 커지는 당신',
    description:
      '권위와 시간압박에는 거의 흔들리지 않고 검증 습관도 탄탄하지만, 큰 이득이 걸리면 판단이 살짝 느슨해지는 유형입니다. 평소엔 빈틈없지만 고수익 제안 앞에서는 한 번 더 스스로를 점검할 필요가 있습니다.',
    weakAgainst: ['공격적인 고수익 투자 제안'],
    strengths: ['기관 사칭 즉시 간파', '긴급 압박에 흔들리지 않음', '대부분의 상황에서 원칙대로 확인'],
    mbtiMatch: 'ENTJ',
    characterTitle: '야망과 냉정 사이의 전략가',
    category: 'defensive',
    characterAccessories: ['greed', 'verify'],
  },
  ESTJ: {
    typeCode: 'ESTJ',
    typeName: '규율가형 (마감엔 살짝 약함)',
    tagline: '원칙대로 확인하지만, "마감"이라는 말엔 조금 서두르게 되는 당신',
    description:
      '권위나 이득 미끼에는 거의 반응하지 않고 검증 습관도 좋지만, 시간 압박이 강하게 들어오면 확인 절차를 살짝 서두르는 유형입니다. 전반적으로 단단하지만 "지금 당장"이라는 말엔 예외적으로 취약할 수 있습니다.',
    weakAgainst: ['기한 임박을 강조하는 문서·통보'],
    strengths: ['기관 사칭·고수익 미끼 즉시 간파', '원칙과 절차를 중시하는 확인 습관', '근거 없는 주장에 흔들리지 않음'],
    mbtiMatch: 'ESTJ',
    characterTitle: '규율가, 마감 앞에서만 흔들림',
    category: 'defensive',
    characterAccessories: ['urgency', 'verify'],
  },
  ENTP: {
    typeCode: 'ENTP',
    typeName: '논리적 전략가형 (두 유혹에 살짝 흔들림)',
    tagline: '대체로 의심이 많지만, 급하면서 이득까지 있으면 살짝 혹하는 당신',
    description:
      '권위에는 잘 흔들리지 않고 검증 습관도 좋은 편이지만, 시간 압박과 이득이 동시에 들어오면 판단이 조금 빨라지는 유형입니다. 평소엔 논리적으로 따지지만 이 조합 앞에서는 예외적으로 서두를 수 있습니다.',
    weakAgainst: ['한정 시간 고수익 제안'],
    strengths: ['기관·직급 사칭에 잘 흔들리지 않음', '근거를 따지는 습관', '대부분의 상황에서 침착한 분석'],
    mbtiMatch: 'ENTP',
    characterTitle: '논리적이나 두 유혹엔 흔들리는 전략가',
    category: 'defensive',
    characterAccessories: ['urgency', 'greed', 'verify'],
  },
  INTJ: {
    typeCode: 'INTJ',
    typeName: '권위 앞에서만 흔들리는 전략형',
    tagline: '대부분 회의적이지만, 직함 앞에서는 의외로 마음이 약해지는 당신',
    description:
      '시간압박과 이득 유혹에는 거의 반응하지 않고 검증 습관도 확실하지만, 권위 있는 상대 앞에서는 의외로 판단이 느슨해지는 유형입니다. 평소엔 철저히 분석하지만 직함이나 소속 앞에서 한 번 더 확인하는 습관이 필요합니다.',
    weakAgainst: ['기관·상급자를 사칭한 요청'],
    strengths: ['긴급 압박에 흔들리지 않음', '고수익 미끼 즉시 차단', '대부분 스스로 근거를 따짐'],
    mbtiMatch: 'INTJ',
    characterTitle: '권위 앞에서만 흔들리는 전략가',
    category: 'defensive',
    characterAccessories: ['authority', 'verify'],
  },
  INFJ: {
    typeCode: 'INFJ',
    typeName: '이상주의자의 숨은 빈틈형',
    tagline: '시간에는 끄떡없지만, 권위와 이득이 함께 오면 숨은 빈틈이 열리는 당신',
    description:
      '시간 압박에는 매우 강하고 검증 습관도 좋지만, 권위 있는 상대가 이득까지 제시하면 판단이 살짝 흔들리는 유형입니다. "기관 추천 고수익 상품"류의 결합형 수법에 예외적으로 취약할 수 있습니다.',
    weakAgainst: ['기관·전문가 명의의 고수익 추천'],
    strengths: ['긴급·마감 압박에 흔들리지 않음', '대부분의 상황에서 근거를 요구함', '감정보다 검증을 우선함'],
    mbtiMatch: 'INFJ',
    characterTitle: '이상주의자의 숨은 빈틈',
    category: 'defensive',
    characterAccessories: ['authority', 'greed', 'verify'],
  },
  INTP: {
    typeCode: 'INTP',
    typeName: '이론가형 (권위+재촉엔 살짝 약함)',
    tagline: '이득 앞에서는 냉정하지만, 권위와 재촉이 겹치면 살짝 흔들리는 당신',
    description:
      '이득 유혹에는 거의 반응하지 않고 검증 습관도 좋은 편이지만, 권위 있는 상대가 시간까지 압박하면 판단이 조금 빨라지는 유형입니다. 평소엔 이론적으로 따지지만 이 조합에서는 예외적으로 서두를 수 있습니다.',
    weakAgainst: ['상급자·기관을 사칭한 긴급 지시'],
    strengths: ['고수익 미끼에 거의 반응 없음', '대체로 근거를 요구하는 습관', '침착하게 상황을 분석'],
    mbtiMatch: 'INTP',
    characterTitle: '논리는 강하나 재촉엔 약한 이론가',
    category: 'defensive',
    characterAccessories: ['authority', 'urgency', 'verify'],
  },
  ISTP: {
    typeCode: 'ISTP',
    typeName: '폭풍 속의 관찰자형',
    tagline: '속으로는 요동치지만, 끝내 확인하고야 마는 당신',
    description:
      '권위·시간압박·이득 세 가지 자극 모두에 내적으로는 반응하지만, 검증 습관이 워낙 확고해 결국 행동으로 옮기기 전에 멈추고 확인하는 유형입니다. 겉으로는 냉정해 보이지만 속에서는 여러 감정이 오가는 타입입니다.',
    weakAgainst: ['세 가지 압박이 동시에 몰아치는 정교한 복합 수법'],
    strengths: ['결정적 순간에 반드시 검증 절차를 거침', '압박이 강할수록 오히려 더 신중해짐', '겉으로 침착함을 유지'],
    mbtiMatch: 'ISTP',
    characterTitle: '폭풍 속의 냉정한 관찰자',
    category: 'defensive',
    characterAccessories: ['authority', 'urgency', 'greed', 'verify'],
  },
};
