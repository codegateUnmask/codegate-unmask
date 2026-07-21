import type { VulnProfile } from '@/lib/types';

// axes 는 scoring.ts 에서 실제 계산값으로 채워 넣는다. 여기서는 유형별 고정 정보만 정의.
export type ProfileTypeBase = Omit<VulnProfile, 'axes'>;

export const PROFILE_TYPES: Record<string, ProfileTypeBase> = {
  AUTH_DOMINANT: {
    typeCode: 'AUTH_DOMINANT',
    typeName: '권위 맹신형',
    description:
      '"기관"이라는 세 글자 앞에서 판단력이 잠시 로그아웃되는 타입. 정장 입은 목소리, 관공서 로고, 딱딱한 말투에 특히 약하다. 사기꾼 입장에선 가장 사랑하는 고객.',
    weakAgainst: [
      '경찰청·검찰청·금융감독원 사칭 전화',
      '관공서 로고가 찍힌 위조 공문서',
      '전문 용어를 남발하는 가짜 전문가 화법',
    ],
  },
  URGENCY_DOMINANT: {
    typeCode: 'URGENCY_DOMINANT',
    typeName: '타임어택 패닉형',
    description:
      '"지금 아니면 끝"이라는 말을 들으면 뇌가 초시계 모드로 전환된다. 남들보다 빨리 결정하는 게 손해를 막는 거라 믿지만, 사실 그 조급함이 사기꾼의 가장 큰 무기다.',
    weakAgainst: [
      '선착순 마감·매물 소진 임박 문구',
      '"오늘 안에 계좌이체 안 하면 취소"식 압박',
      '급전세·급매 특약 조건',
    ],
  },
  GREED_DOMINANT: {
    typeCode: 'GREED_DOMINANT',
    typeName: '대박 헌터형',
    description:
      '시세보다 싼 매물, 확정 고수익, 공짜 사은품을 보면 심장이 먼저 반응한다. "이득 앞에서 위험 신호는 배경음악처럼 흐려지는" 전형적인 유형.',
    weakAgainst: [
      '시세 대비 파격적으로 싼 전세·매물',
      '원금·고수익 보장형 투자 권유',
      '가입만 하면 주는 과도한 사은품·캐시백',
    ],
  },
  VERIFY_MASTER: {
    typeCode: 'VERIFY_MASTER',
    typeName: '확인병 만렙형',
    description:
      '뭐든 일단 대조하고, 하루 묵혀두고, 공식 채널로 재확인하는 타입. 사기꾼 입장에선 제일 피하고 싶은 상대. 다만 아무리 확인해도 원본 자체가 정교하게 위조되면 방심은 금물.',
    weakAgainst: ['정교하게 위조된 등기부등본·서류', '검증 절차 자체를 흉내 낸 2차 사기'],
  },
  AUTH_URGENCY: {
    typeCode: 'AUTH_URGENCY',
    typeName: '공권력 압박 콤보형',
    description:
      '"기관"과 "지금 당장"이 동시에 오면 저항력이 급격히 떨어진다. "검찰입니다, 지금 계좌를 확인 안 하면 불이익이 있습니다" 같은 대사에 특히 취약한, 보이스피싱 각본의 주인공 타입.',
    weakAgainst: [
      '검찰·금감원 사칭 + 즉시 계좌이체 요구',
      '국세청 세금 체납 문자 + 마감 시한 압박',
      '"수사 협조" 명목의 긴급 송금 요청',
    ],
  },
  AUTH_GREED: {
    typeCode: 'AUTH_GREED',
    typeName: '공인 대박 제안형',
    description:
      '권위 있어 보이는 곳에서 좋은 조건을 내밀면 의심이 반으로 줄어든다. "은행 이름 + 특판 상품"의 조합 앞에서 가장 약해지는 유형.',
    weakAgainst: [
      '금융기관 사칭 특판 예금·대출 상품',
      '공공기관 명의를 내건 대출 알선 문자',
      '"협회 인증"을 앞세운 투자 리딩방',
    ],
  },
  URGENCY_GREED: {
    typeCode: 'URGENCY_GREED',
    typeName: '지금 아니면 손해형',
    description:
      '좋은 조건 + 마감 임박이 겹치면 브레이크가 사라진다. "오늘 계약금 넣으면 500만 원 싸게"류의 문장에 특히 취약하다.',
    weakAgainst: [
      '한정 수량 급매·급전세 매물',
      '오늘까지 계약금 입금 시 할인 특약',
      '마감 카운트다운이 붙은 투자 프로모션',
    ],
  },
  ALL_ROUND_RISK: {
    typeCode: 'ALL_ROUND_RISK',
    typeName: '만능 먹잇감형',
    description:
      '권위에도, 압박에도, 이득에도 골고루 흔들리고 확인 습관까지 느슨하다. 사기꾼 입장에선 어떤 각본을 써도 통하는, 그야말로 최애 타겟. 지금부터 훈련이 시급하다.',
    weakAgainst: [
      '기관 사칭 + 마감 압박 + 유리한 조건이 결합된 복합형 사기',
      '보이스피싱 각본 대부분',
      '전세사기 최신 수법 전반',
    ],
  },
};
