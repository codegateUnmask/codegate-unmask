// ============================================================
// [B 담당] 목업 데이터 — A의 ScanResult 계약에 100% 맞춤.
// docType별 샘플 + 각 샘플의 triage(1차)·full(2차) 결과.
// quote는 반드시 샘플 원문에 그대로 포함 → 원문 형광펜 매칭용.
// ============================================================

import type { DocType, Finding, ScanResult, VulnProfile } from './types';

/** [B 확장] 절충안 필드 — A의 Finding을 건드리지 않는 B측 확장 타입.
 *  A가 types.ts에 compromise를 정식 추가하면 이 타입은 제거하고 Finding으로 통일. */
export type ScanFinding = Finding & { compromise?: string };
type SampleResult = Omit<ScanResult, 'docType' | 'scannedAt' | 'findings'> & {
  findings: ScanFinding[];
};

export interface Sample {
  name: string;
  text: string;
  /** 빠른 1차 판독 (위험 조항 우선, 상세설명 없음) */
  triage: SampleResult;
  /** 정밀 2차 판독 (전체 조항 + detailedReason 채워짐) */
  full: SampleResult;
}

const EMPTY = {
  missingDocuments: [] as string[],
  unverifiable: [] as string[],
  requestPhrases: [] as string[],
  officialChannels: [] as string[],
  needsExpertReview: [] as string[],
};

export const SAMPLES: Record<DocType, Sample[]> = {
  lease: [
    {
      name: '샘플 ① 위험한 계약서',
      text: `부동산 임대차 계약서 (월세)

제3조 (차임 지급) 차임은 매월 25일에 지급하며, 관리비는 실비로 정산한다.

제7조 (원상복구) 퇴거 시 원상복구 비용은 임차인이 전액 부담한다.

제9조 (보증금 반환) 임대인의 사정으로 보증금 반환이 지연되더라도 임차인은 이에 대해 이의를 제기하지 아니한다.`,
      triage: {
        ...EMPTY,
        overallLevel: 'danger',
        summary: '보증금을 돌려받지 못할 수 있는 조항이 확인됩니다. 정밀 판독을 진행합니다.',
        findings: [
          {
            id: 'l1', level: 'danger', clauseTitle: '제9조 (보증금 반환)',
            quote: '임대인의 사정으로 보증금 반환이 지연되더라도 임차인은 이에 대해 이의를 제기하지 아니한다.',
            reason: '보증금 반환이 늦어져도 항의할 권리를 미리 포기시키는 조항입니다.',
          },
        ],
      },
      full: {
        overallLevel: 'danger',
        summary: '보증금을 돌려받지 못할 수 있는 조항이 1개, 확인이 필요한 조항이 1개 있습니다. 이 상태로는 서명을 권하지 않습니다.',
        missingDocuments: ['등기부등본(선순위 권리관계 확인용)'],
        unverifiable: ['실제 임대인이 등기부상 소유자와 같은지 여부'],
        requestPhrases: [
          '"제9조는 삭제해 주세요. 대신 종료일 반환·지연이자 조항을 넣죠."',
          '"제7조에 통상적인 마모는 제외한다는 문구를 추가해 주세요."',
        ],
        officialChannels: ['주택도시보증공사(HUG) 1566-9009', '대한법률구조공단 132'],
        needsExpertReview: ['보증금 반환 조항의 효력 여부'],
        personalized:
          '권위에 약한 유형이시네요. 중개사가 "원래 다 이렇게 해요"라고 해도, 아래 빨간 조항은 반드시 삭제를 요구하세요.',
        findings: [
          {
            id: 'l1', level: 'danger', clauseTitle: '제9조 (보증금 반환)',
            quote: '임대인의 사정으로 보증금 반환이 지연되더라도 임차인은 이에 대해 이의를 제기하지 아니한다.',
            reason: '보증금 반환이 늦어져도 항의할 권리를 미리 포기시키는 조항입니다. 전세사기에서 가장 자주 등장하는 형태예요.',
            detailedReason:
              '보증금은 계약이 끝나면 돌려받아야 하는 돈입니다. 이 조항은 "늦어져도 이의 없음"에 미리 동의하게 만들어, 반환이 무한정 지연돼도 법적으로 다투기 어렵게 만듭니다. 다만 임차인에게 일방적으로 불리한 약정은 강행규정 위반으로 효력이 없을 수 있습니다.',
            action: '이 조항의 삭제를 요구하세요. 거부하면 계약을 재고하는 것이 안전합니다.',
            compromise: '삭제를 끝내 거부하면 "보증금은 계약 종료일에 반환하고, 지연 시 지연이자를 지급한다"로 바꾸자고 제안하세요.',
            legalBasis: '주택임대차보호법 제10조 (강행규정) — 임차인에게 불리한 약정은 효력이 없습니다.',
          },
          {
            id: 'l2', level: 'warning', clauseTitle: '제7조 (원상복구)',
            quote: '퇴거 시 원상복구 비용은 임차인이 전액 부담한다.',
            reason: '살면서 자연히 생긴 마모(통상 손모)까지 임차인이 떠안게 될 수 있습니다.',
            detailedReason:
              '벽지 변색이나 바닥 눌림처럼 정상적으로 살기만 해도 생기는 마모는 원래 임대인 부담이라는 게 판례의 태도입니다. "전액 부담"이라고만 적혀 있으면 이런 자연 마모까지 청구당할 여지가 생깁니다.',
            action: '"통상적인 마모는 제외한다"는 문구를 넣어 달라고 요청하세요.',
            compromise: '문구 수정이 어렵다면, 입주 당일 집 상태를 사진으로 남기고 "입주 시 상태를 기준으로 한다"는 한 줄이라도 추가하세요.',
          },
          {
            id: 'l3', level: 'safe', clauseTitle: '제3조 (차임 지급)',
            quote: '차임은 매월 25일에 지급하며, 관리비는 실비로 정산한다.',
            reason: '지급일과 정산 방식이 명확히 적혀 있어 분쟁 소지가 적습니다.',
          },
        ],
      },
    },
    {
      name: '샘플 ② 무난한 계약서',
      text: `부동산 임대차 계약서 (월세)

제2조 (보증금) 보증금은 계약 종료와 동시에 임차인에게 반환한다.

제5조 (수선) 주요 설비의 수선은 임대인이 부담하고, 임차인의 고의나 과실로 인한 파손은 임차인이 부담한다.

제8조 (중도 해지) 임차인이 중도 해지하는 경우 신규 임차인의 중개보수는 임차인이 부담한다.`,
      triage: {
        ...EMPTY,
        overallLevel: 'warning',
        summary: '크게 불리한 조항은 없어 보입니다. 정밀 판독을 진행합니다.',
        findings: [
          {
            id: 'l4', level: 'warning', clauseTitle: '제8조 (중도 해지)',
            quote: '임차인이 중도 해지하는 경우 신규 임차인의 중개보수는 임차인이 부담한다.',
            reason: '중도 퇴거 시 비용 부담 조건을 확인해 두는 게 좋습니다.',
          },
        ],
      },
      full: {
        overallLevel: 'warning',
        summary: '크게 불리한 조항은 없지만, 중도 해지 시 비용 부담은 조건을 확인해 두는 게 좋습니다.',
        missingDocuments: [],
        unverifiable: [],
        requestPhrases: ['"중개보수는 법정 한도 내로 부담 범위를 정해 주세요."'],
        officialChannels: ['대한법률구조공단 132'],
        needsExpertReview: [],
        findings: [
          {
            id: 'l4', level: 'warning', clauseTitle: '제8조 (중도 해지)',
            quote: '임차인이 중도 해지하는 경우 신규 임차인의 중개보수는 임차인이 부담한다.',
            reason: '중도 퇴거 시 중개보수 부담은 통상적이지만, 금액 상한이 없으면 예상보다 큰 비용이 될 수 있어요.',
            detailedReason:
              '세입자가 계약 기간을 못 채우고 나갈 때 새 세입자를 구하는 중개보수를 부담하는 건 관행입니다. 다만 "법정 한도"라는 기준이 없으면 과다 청구 여지가 있으니 범위를 명시하는 게 안전합니다.',
            action: '부담 범위를 "법정 중개보수 한도 내"로 명시해 달라고 요청하세요.',
            compromise: '대신 "임대인도 신규 임차인 모집에 협조한다"는 문구를 함께 넣으면 공실 기간 부담을 줄일 수 있어요.',
          },
          {
            id: 'l5', level: 'safe', clauseTitle: '제2조 (보증금)',
            quote: '보증금은 계약 종료와 동시에 임차인에게 반환한다.',
            reason: '반환 시점이 "계약 종료와 동시"로 명확해 보증금이 묶일 여지가 적습니다.',
          },
          {
            id: 'l6', level: 'safe', clauseTitle: '제5조 (수선)',
            quote: '주요 설비의 수선은 임대인이 부담하고, 임차인의 고의나 과실로 인한 파손은 임차인이 부담한다.',
            reason: '수리 책임이 법 취지대로 나뉘어 있어 분쟁 소지가 적습니다.',
            legalBasis: '민법 제623조 — 임대인은 목적물을 사용·수익에 필요한 상태로 유지할 의무가 있습니다.',
          },
        ],
      },
    },
  ],
  labor: [
    {
      name: '샘플 ① 위험한 계약서',
      text: `근로계약서

제2조 (수습) 수습기간 3개월 동안 급여는 정상 급여의 70퍼센트를 지급한다.

제5조 (손해배상) 지각 또는 실수로 손해가 발생한 경우 해당 금액을 급여에서 공제한다.

제7조 (퇴직) 1년 이내 퇴사하는 경우 교육비 100만원을 회사에 배상한다.

제9조 (보험) 당사자 간 합의에 따라 4대보험에는 가입하지 않는다.`,
      triage: {
        ...EMPTY,
        overallLevel: 'danger',
        summary: '임금 공제·퇴사 위약금 등 위법 소지 조항이 확인됩니다. 정밀 판독을 진행합니다.',
        findings: [
          {
            id: 'w1', level: 'danger', clauseTitle: '제5조 (손해배상)',
            quote: '지각 또는 실수로 손해가 발생한 경우 해당 금액을 급여에서 공제한다.',
            reason: '임금은 전액 지급이 원칙이라 월급에서 임의 공제는 허용되지 않습니다.',
          },
        ],
      },
      full: {
        overallLevel: 'danger',
        summary: '월급에서 임의로 공제하고 퇴사를 위약금으로 묶는 조항이 있습니다. 서명 전에 반드시 수정을 요구하세요.',
        missingDocuments: ['4대보험 가입 확인서'],
        unverifiable: ['실제 근무시간·휴게시간 운영 방식'],
        requestPhrases: [
          '"제5조 임금 공제 조항은 삭제해 주세요."',
          '"제9조를 관계 법령에 따라 4대보험에 가입한다로 바꿔 주세요."',
        ],
        officialChannels: ['고용노동부 1350', '근로복지공단 1588-0075'],
        needsExpertReview: ['교육비 배상 조항의 효력 여부'],
        personalized:
          '시간 압박에 약한 유형이시네요. "오늘 사인 안 하면 자리 없다"는 말이 나와도, 빨간 조항을 고치기 전에는 사인하지 마세요.',
        findings: [
          {
            id: 'w1', level: 'danger', clauseTitle: '제5조 (손해배상)',
            quote: '지각 또는 실수로 손해가 발생한 경우 해당 금액을 급여에서 공제한다.',
            reason: '일한 만큼의 임금은 전액 지급이 원칙이라, 회사가 손해를 이유로 월급에서 임의로 빼는 것은 허용되지 않습니다.',
            detailedReason:
              '근로기준법은 임금을 통화로 전액 직접 지급하도록 정합니다. 손해가 실제로 발생했다면 회사가 별도로 청구·정산할 문제이지, 월급에서 먼저 빼는 방식은 임금 전액지급 원칙 위반입니다.',
            action: '이 조항의 삭제를 요구하세요. 손해가 있다면 회사가 별도로 청구하는 것이 원칙입니다.',
            compromise: '삭제가 어렵다면 "손해 발생 시 별도 협의하여 정산한다"로 바꾸자고 제안하세요. 급여에서 바로 빼는 방식만은 막아야 해요.',
            legalBasis: '근로기준법 제43조 — 임금은 전액을 근로자에게 직접 지급해야 합니다.',
          },
          {
            id: 'w2', level: 'danger', clauseTitle: '제7조 (퇴직)',
            quote: '1년 이내 퇴사하는 경우 교육비 100만원을 회사에 배상한다.',
            reason: '그만두면 얼마를 물어낸다고 미리 정해두는 위약금 조항은 법이 금지하고 있어 무효일 가능성이 큽니다.',
            detailedReason:
              '근로기준법은 위약금이나 손해배상액을 미리 정하는 근로계약을 금지합니다. 직업 선택의 자유를 돈으로 묶는 것을 막기 위해서예요. 이런 조항은 적혀 있어도 효력이 없을 가능성이 높습니다.',
            action: '삭제를 요구하세요. 이런 조항을 고집하는 회사라면 다른 조건도 의심해 보세요.',
            compromise: '회사가 교육비 회수를 걱정한다면, 위약금 대신 "실제 지출한 교육비를 증빙 기준으로 정산"하는 별도 합의로 바꾸자고 제안하세요.',
            legalBasis: '근로기준법 제20조 — 위약금·손해배상액을 미리 정하는 계약은 금지됩니다.',
          },
          {
            id: 'w3', level: 'danger', clauseTitle: '제9조 (보험)',
            quote: '당사자 간 합의에 따라 4대보험에는 가입하지 않는다.',
            reason: '4대보험은 요건이 되면 의무 가입이라 합의로도 뺄 수 없습니다.',
            detailedReason:
              '4대보험 가입은 법정 의무라 근로자가 동의했더라도 미가입은 위법입니다. 당장 실수령이 늘어 보여도 실업급여·산재 보상·연금을 전부 포기하는 셈이라 장기적으로 손해가 훨씬 큽니다.',
            action: '"관계 법령에 따라 4대보험에 가입한다"로 수정을 요구하세요.',
            compromise: '이 조항은 절충의 여지가 없어요. 의무 가입이라 합의 자체가 무효입니다. 수정을 거부하면 계약을 다시 생각하세요.',
          },
          {
            id: 'w4', level: 'warning', clauseTitle: '제2조 (수습)',
            quote: '수습기간 3개월 동안 급여는 정상 급여의 70퍼센트를 지급한다.',
            reason: '수습 감액은 1년 이상 계약에서만, 최저임금의 90% 아래로는 내려갈 수 없습니다.',
            detailedReason:
              '수습기간 감액은 계약 기간이 1년 이상일 때만 가능하고, 그때도 최저임금의 90% 미만으로는 줄 수 없습니다. 계약 기간이 1년 미만이거나 단순노무직이면 감액 자체가 불가능합니다.',
            action: '계약 기간과 감액 후 시급을 확인하고, 기준 미달이면 조정을 요구하세요.',
            compromise: '감액을 유지하고 싶어 한다면 수습 기간을 1개월로 줄이거나 감액 폭을 10%로 낮추자고 제안해 보세요.',
            legalBasis: '최저임금법 제5조 — 수습 감액은 1년 이상 계약, 최저임금의 90% 이상에서만 가능합니다.',
          },
        ],
      },
    },
    {
      name: '샘플 ② 무난한 계약서',
      text: `근로계약서

제3조 (임금) 임금은 월 220만원으로 하며 매월 10일에 전액 지급한다.

제4조 (연장근로) 연장근로가 발생하는 경우 근로기준법에 따른 가산수당을 지급한다.

제6조 (포괄임금) 월 급여에는 월 10시간분의 연장근로수당이 포함된 것으로 한다.`,
      triage: {
        ...EMPTY,
        overallLevel: 'warning',
        summary: '기본 조건은 갖춰져 있습니다. 정밀 판독을 진행합니다.',
        findings: [
          {
            id: 'w5', level: 'warning', clauseTitle: '제6조 (포괄임금)',
            quote: '월 급여에는 월 10시간분의 연장근로수당이 포함된 것으로 한다.',
            reason: '포함 시간을 넘긴 초과분 처리가 명시돼 있는지 확인이 필요합니다.',
          },
        ],
      },
      full: {
        overallLevel: 'warning',
        summary: '기본 조건은 잘 갖춰져 있습니다. 포괄임금 조항의 초과분 처리만 확인하면 좋아요.',
        missingDocuments: [],
        unverifiable: ['실제 연장근로 발생 시간'],
        requestPhrases: ['"월 10시간 초과분은 별도 지급한다는 문구를 추가해 주세요."'],
        officialChannels: ['고용노동부 1350'],
        needsExpertReview: [],
        findings: [
          {
            id: 'w5', level: 'warning', clauseTitle: '제6조 (포괄임금)',
            quote: '월 급여에는 월 10시간분의 연장근로수당이 포함된 것으로 한다.',
            reason: '포함된 시간이 숫자로 명시된 건 좋은 신호예요. 다만 10시간을 넘긴 부분의 별도 지급이 적혀 있지 않습니다.',
            detailedReason:
              '포괄임금제가 유효하려면 포함된 연장근로 시간이 구체적으로 명시돼야 하는데, 이 계약은 "월 10시간분"으로 밝혀 둔 점은 좋습니다. 다만 그 10시간을 초과해 일한 부분은 별도로 받아야 하므로, 초과분 처리 문구가 필요합니다.',
            action: '"월 10시간 초과분은 별도 지급한다"는 문구를 추가해 달라고 요청하세요.',
            compromise: '문구 추가가 어렵다면, 매월 연장근로 시간을 기록해 서로 공유하기로 하는 조건이라도 넣어 두세요.',
          },
          {
            id: 'w6', level: 'safe', clauseTitle: '제3조 (임금)',
            quote: '임금은 월 220만원으로 하며 매월 10일에 전액 지급한다.',
            reason: '금액·지급일·전액 지급이 명확해 임금 관련 분쟁 소지가 적습니다.',
          },
          {
            id: 'w7', level: 'safe', clauseTitle: '제4조 (연장근로)',
            quote: '연장근로가 발생하는 경우 근로기준법에 따른 가산수당을 지급한다.',
            reason: '연장근로 보상 원칙이 법 기준으로 명시되어 있습니다.',
          },
        ],
      },
    },
  ],
  terms: [
    {
      name: '약관 샘플 (준비 중)',
      text: '약관 판독은 Day2 지식 모듈(terms) 연결 후 지원됩니다.',
      triage: { ...EMPTY, overallLevel: 'safe', summary: '약관 모듈은 준비 중입니다.', findings: [] },
      full: { ...EMPTY, overallLevel: 'safe', summary: '약관 모듈은 준비 중입니다.', findings: [] },
    },
  ],
  message: [
    {
      name: '스미싱 샘플',
      text: `[국세청] 미납 세금 안내 http://bit.ly/xxxxx
기한 내 미납부 시 불이익이 발생할 수 있습니다.`,
      triage: {
        ...EMPTY,
        overallLevel: 'danger',
        summary: '공공기관 사칭 스미싱으로 의심됩니다. 정밀 판독을 진행합니다.',
        findings: [
          {
            id: 'm1', level: 'danger',
            quote: '[국세청] 미납 세금 안내 http://bit.ly/xxxxx',
            reason: '공공기관은 단축 URL을 쓰지 않습니다.',
          },
        ],
      },
      full: {
        overallLevel: 'danger',
        summary: '공공기관을 사칭한 스미싱 문자로 판단됩니다. 링크를 누르지 마세요.',
        missingDocuments: [],
        unverifiable: ['발신 번호의 실제 소유자'],
        requestPhrases: [],
        officialChannels: ['국세청 홈택스(직접 접속)', '보이스피싱 통합신고 112'],
        needsExpertReview: [],
        findings: [
          {
            id: 'm1', level: 'danger',
            quote: '[국세청] 미납 세금 안내 http://bit.ly/xxxxx',
            reason: '공공기관은 단축 URL(bit.ly 등)을 쓰지 않습니다. 국세청은 문자로 링크를 보내 납부를 유도하지 않아요.',
            detailedReason:
              '정부기관 안내는 공식 도메인(go.kr)이나 앱을 통해 이뤄집니다. bit.ly 같은 단축 링크로 납부·인증을 유도하면 거의 예외 없이 피싱입니다. 링크를 누르는 순간 악성 앱이 설치되거나 개인정보가 탈취될 수 있습니다.',
            action: '링크를 누르지 말고 삭제하세요. 확인이 필요하면 홈택스에 직접 접속하세요.',
          },
        ],
      },
    },
  ],
};

export const MOCK_PROFILE: VulnProfile = {
  typeCode: 'AUTHORITY_DOMINANT',
  typeName: '권위 앞에 약해지는 형',
  tagline: '"기관에서 왔다"는 말 한마디에 마음이 놓이는 당신',
  axes: { authority: 82, urgency: 61, greed: 34, verify: 28 },
  description:
    '공공기관·은행·회사 이름이 붙으면 의심의 문턱이 크게 낮아지는 유형입니다. 사칭형 수법에 특히 취약합니다.',
  weakAgainst: ['기관 사칭 문자', '중개사·집주인 구두 약속', '전세 계약 특약 함정'],
  createdAt: '2026-07-21T13:50:00.000Z',
};
