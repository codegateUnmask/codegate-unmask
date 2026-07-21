// ============================================================
// 유형 정의 데이터
//
// 취약형 4종(무엇에 약한지) + 방어형 5종(무엇에 강한지) = 총 9종
// scoring.ts 의 determineType() 이 반환하는 typeCode 와
// 이 객체의 key 가 정확히 일치해야 합니다.
// ============================================================

import type { ProfileCategory } from '../types';

export interface ProfileTypeDef {
  typeCode: string;
  typeName: string;
  tagline: string;
  description: string;
  /** 취약형: 특히 취약한 수법. 방어형: 빈 배열 또는 "그래도 방심 금물"용 1~2개 */
  weakAgainst: string[];
  /** 방어형: 특히 강한 방어 포인트. 취약형: 빈 배열 */
  strengths: string[];
  mbtiMatch: string;
  characterTitle: string;
  category: ProfileCategory;
}

export const PROFILE_TYPES: Record<string, ProfileTypeDef> = {
  // ============ 취약형 (vulnerable) ============
  AUTHORITY_DOMINANT: {
    typeCode: 'AUTHORITY_DOMINANT',
    typeName: '권위 앞에 약해지는 형',
    tagline: '"기관에서 왔다"는 말 한마디에 마음이 놓이는 당신',
    description:
      '공공기관·은행·회사 이름이 붙으면 의심의 문턱이 크게 낮아지는 유형입니다. 상대가 근거를 대지 않아도 직함이나 기관명만으로 신뢰하는 경향이 있어, 사칭형 수법에 특히 취약합니다.',
    weakAgainst: ['기관 사칭 전화·문자', '중개사·집주인의 구두 약속', '직급을 앞세운 지시'],
    strengths: [],
    mbtiMatch: 'ISFJ',
    characterTitle: '완장 앞의 순정파',
    category: 'vulnerable',
  },
  URGENCY_DOMINANT: {
    typeCode: 'URGENCY_DOMINANT',
    typeName: '카운트다운에 흔들리는 형',
    tagline: '"지금 아니면 늦는다"는 말에 심장이 먼저 뛰는 당신',
    description:
      '시간이 없다는 압박이 들어오면 판단력보다 조급함이 앞서는 유형입니다. 마감·긴급·정지 같은 단어가 등장하는 순간 확인 절차를 건너뛰기 쉬워, 급전 요구형 사기에 특히 노출되기 쉽습니다.',
    weakAgainst: ['계좌 정지 임박 문자', '가족 사칭 급전 요청', '한정 시간 투자 권유'],
    strengths: [],
    mbtiMatch: 'ESFP',
    characterTitle: '카운트다운 술래',
    category: 'vulnerable',
  },
  GREED_DOMINANT: {
    typeCode: 'GREED_DOMINANT',
    typeName: '황금빛 미끼에 끌리는 형',
    tagline: '"공짜 or 대박"이라는 말에 눈이 반짝이는 당신',
    description:
      '이득이나 손해 회피 앞에서 이성적 판단이 흐려지는 유형입니다. 원금 보장, 고수익, 세금 환급처럼 달콤한 제안에 먼저 반응해, 리딩방·환급 사기·초저가 미끼형 수법에 취약합니다.',
    weakAgainst: ['원금 보장 고수익 투자 리딩방', '세금 환급 링크', '시세보다 지나치게 싼 매물'],
    strengths: [],
    mbtiMatch: 'ENFP',
    characterTitle: '황금빛 나침반 분실자',
    category: 'vulnerable',
  },
  LOW_VERIFY_DRIFTER: {
    typeCode: 'LOW_VERIFY_DRIFTER',
    typeName: '검증 없이 흘러가는 형',
    tagline: '일단 넘어가고 나중에 후회하는 당신',
    description:
      '특정 자극 하나에 크게 반응하기보다, 전반적으로 확인하고 검증하는 습관 자체가 약한 유형입니다. 어떤 수법이든 "그런가 보다" 하고 넘어가는 경향이 있어, 여러 유형의 사기에 고르게 노출됩니다.',
    weakAgainst: ['낯선 링크 클릭', '개인정보·인증번호 요청', '용어를 이해하지 못한 채 서명'],
    strengths: [],
    mbtiMatch: 'INFP',
    characterTitle: '무방비 노마드',
    category: 'vulnerable',
  },

  // ============ 방어형 (defensive) ============
  ULTRA_SKEPTIC: {
    typeCode: 'ULTRA_SKEPTIC',
    typeName: '만사 불신의 대현자형',
    tagline: '기관·지인·화면 위 숫자, 그 무엇도 곧이곧대로 믿지 않는 당신',
    description:
      '검증 습관이 극도로 높고 권위·시간압박·이득 미끼에 거의 반응하지 않는 유형입니다. 누가 뭐라 해도 스스로 확인하기 전까지는 움직이지 않아, 어떤 사칭·급전·투자 미끼에도 좀처럼 흔들리지 않습니다.',
    weakAgainst: ['지나친 불신으로 정당한 요청까지 늦게 처리할 수 있음'],
    strengths: ['기관 사칭 완전 무시', '시간 압박에 흔들리지 않는 침착함', '고수익 미끼 즉시 차단'],
    mbtiMatch: 'INTJ',
    characterTitle: '절대 회의의 대현자',
    category: 'defensive',
  },
  FORTRESS: {
    typeCode: 'FORTRESS',
    typeName: '철옹성 균형 수호자형',
    tagline: '어느 쪽으로도 기울지 않는, 흔들림 없는 균형의 소유자',
    description:
      '권위·시간압박·이득 어느 자극에도 고르게 낮은 반응을 보이면서 검증 습관은 확실한 유형입니다. 특정 약점이 없어 사기꾼 입장에서 가장 공략하기 어려운 상대이며, 침착함과 꼼꼼함을 동시에 갖췄습니다.',
    weakAgainst: ['너무 신중해 좋은 기회도 신중히 살피느라 늦게 잡을 수 있음'],
    strengths: ['모든 유형의 압박에 균형 잡힌 대응', '감정에 휘둘리지 않는 판단력', '주변에 사기 경보를 잘 알려주는 편'],
    mbtiMatch: 'ISTJ',
    characterTitle: '강철 방패 수호자',
    category: 'defensive',
  },
  AUTHORITY_IMMUNE: {
    typeCode: 'AUTHORITY_IMMUNE',
    typeName: '직함 무효화형',
    tagline: '직함이나 기관명은 당신에게 증거가 아니라 확인 대상일 뿐',
    description:
      '권위에 대한 반응이 특히 낮아, 상대가 어떤 지위나 소속을 내세워도 스스로 근거를 요구하는 유형입니다. 검증 습관도 탄탄해 사칭형 수법 앞에서 가장 먼저 정체를 알아챕니다.',
    weakAgainst: ['정말 급한 공식 요청까지 과도하게 의심해 대응이 늦어질 수 있음'],
    strengths: ['기관·상사 사칭 즉시 간파', '직급을 앞세운 지시에도 원칙대로 확인', '근거 없는 주장에 흔들리지 않음'],
    mbtiMatch: 'ENTJ',
    characterTitle: '직함 무효화 요원',
    category: 'defensive',
  },
  CALM_ANCHOR: {
    typeCode: 'CALM_ANCHOR',
    typeName: '부동심의 닻형',
    tagline: '"지금 당장"이라는 말이 오히려 당신을 더 차분하게 만든다',
    description:
      '시간 압박에 대한 반응이 매우 낮아, 마감이나 긴급 상황이 강조될수록 오히려 속도를 늦추고 확인하는 유형입니다. 급전 요구·기한 임박 문자 같은 조급함을 유도하는 수법에 강합니다.',
    weakAgainst: ['정말 시간이 급한 상황에서도 지나치게 신중해 기회를 놓칠 수 있음'],
    strengths: ['긴급·마감 압박에 흔들리지 않음', '가족 사칭 급전 요청 냉정하게 대응', '재촉받을수록 검증 절차를 늘림'],
    mbtiMatch: 'ISTP',
    characterTitle: '부동심의 닻지기',
    category: 'defensive',
  },
  TEMPTATION_PROOF: {
    typeCode: 'TEMPTATION_PROOF',
    typeName: '유혹 차단 결계형',
    tagline: '공짜와 대박이라는 단어 자체가 당신에겐 경보음',
    description:
      '이득·손해 회피 자극에 대한 반응이 매우 낮아, 고수익이나 공짜 제안 앞에서도 담담한 유형입니다. 원금 보장 투자, 환급 사기, 초저가 미끼처럼 욕심을 자극하는 수법에 특히 강합니다.',
    weakAgainst: ['정말 좋은 기회조차 과도하게 의심해 놓칠 수 있음'],
    strengths: ['고수익 미끼에 무반응', '세금 환급·공짜 이벤트 자동 의심', '초저가 매물 앞에서도 침착'],
    mbtiMatch: 'INTP',
    characterTitle: '유혹 차단 결계사',
    category: 'defensive',
  },
};
