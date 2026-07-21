// ============================================================
// 목업 데이터 — 프론트(B)가 API 완성을 기다리지 않고
// 화면부터 만들 수 있게 하는 파일입니다.
//
// 사용법: 화면에서 이 값을 그대로 렌더링해 두고,
//        나중에 fetch('/api/scan') 결과로 바꾸기만 하면 끝.
//        타입이 같으므로 붙일 때 깨지지 않습니다.
// ============================================================

import type { ScanResult, VulnProfile } from './types';

/** 전월세 계약서 판독 결과 예시 (데모 컷2, 7항목 리포트) */
export const MOCK_SCAN_RESULT: ScanResult = {
  docType: 'lease',
  overallLevel: 'danger',
  summary: '지금 상태로는 서명을 권하지 않습니다. 아래 2개 항목이 해소되면 위험이 크게 줄어듭니다.',
  scannedAt: '2026-07-21T14:00:00.000Z',
  personalized:
    '권위에 약한 유형이시네요. 중개사가 "원래 다 이렇게 해요"라고 해도, 아래 빨간 조항은 반드시 삭제를 요구하세요.',
  findings: [
    {
      id: 'f1',
      level: 'danger',
      clauseTitle: '제9조 (보증금 반환)',
      quote: '임대인의 사정으로 보증금 반환이 지연되더라도 임차인은 이에 대해 이의를 제기하지 아니한다.',
      reason: '보증금을 제때 돌려받지 못해도 항의할 권리를 미리 포기시키는 조항입니다.',
      detailedReason:
        '전세사기에서 가장 자주 등장하는 형태의 조항입니다. 주택임대차보호법은 강행규정이라 임차인에게 불리한 약정은 원칙적으로 효력이 없지만, 분쟁 시 이 조항이 있으면 임차인이 불리한 위치에서 시작하게 됩니다.',
      action: '이 조항의 삭제를 요구하세요. 거부하면 계약을 재고하는 것이 안전합니다.',
      legalBasis: '주택임대차보호법 제10조 (강행규정) — 임차인에게 불리한 약정은 효력이 없습니다.',
    },
    {
      id: 'f2',
      level: 'warning',
      clauseTitle: '제7조 (원상복구)',
      quote: '퇴거 시 원상복구 비용은 임차인이 전액 부담한다.',
      reason: '살면서 자연히 생긴 마모(통상 손모)까지 떠안게 될 수 있습니다.',
      detailedReason:
        '벽지 변색이나 바닥 눌림처럼 정상 사용으로 생긴 손상까지 청구당할 여지가 있습니다. "통상 마모 제외"가 표준임대차계약서의 기본 원칙입니다.',
      action: '"통상적인 마모는 제외한다"는 문구를 넣어 달라고 요청하세요.',
    },
    {
      id: 'f3',
      level: 'safe',
      clauseTitle: '제3조 (차임 지급)',
      quote: '차임은 매월 25일에 지급하며, 관리비는 실비로 정산한다.',
      reason: '지급일과 정산 방식이 명확히 적혀 있어 분쟁 소지가 적습니다.',
    },
  ],
  missingDocuments: ['등기부등본 (최근 발급분)', '대리계약인 경우 위임장·인감증명서'],
  unverifiable: ['계약 상대방과 등기상 소유자의 실제 일치 여부', '선순위 권리(근저당 등) 설정 여부'],
  requestPhrases: [
    '"등기부등본 최근 발급본을 보여주실 수 있을까요?"',
    '"선순위 채권이나 근저당이 있는지 확인해 주실 수 있을까요?"',
  ],
  officialChannels: ['인터넷등기소 (등기부 열람)', '안심전세앱', 'HUG 전세보증보험'],
  needsExpertReview: ['근저당 설정액과 보증금을 합산했을 때 시세 대비 과도한지 여부'],
};

/** 스미싱 문자 판독 결과 예시 (부가 모드, Day2) */
export const MOCK_MESSAGE_RESULT: ScanResult = {
  docType: 'message',
  overallLevel: 'danger',
  summary: '공공기관을 사칭한 스미싱 문자로 판단됩니다. 링크를 누르지 마세요.',
  scannedAt: '2026-07-21T14:05:00.000Z',
  findings: [
    {
      id: 'm1',
      level: 'danger',
      quote: '[국세청] 미납 세금 안내 http://bit.ly/xxxxx',
      reason: '공공기관은 단축 URL(bit.ly 등)을 쓰지 않고, 문자로 링크를 보내 납부를 유도하지 않습니다.',
      action: '링크를 누르지 말고 삭제하세요. 확인이 필요하면 홈택스에 직접 접속하세요.',
    },
  ],
  missingDocuments: [],
  unverifiable: ['발신 번호의 실제 소유자'],
  requestPhrases: [],
  officialChannels: ['국세청 홈택스', '경찰청 사이버수사국 (스미싱 신고)'],
  needsExpertReview: [],
};

/** 진단 결과 예시 (데모 컷1) */
export const MOCK_PROFILE: VulnProfile = {
  typeCode: 'AUTHORITY_DOMINANT',
  typeName: '권위 앞에 약해지는 형',
  tagline: '"기관에서 왔다"는 말 한마디에 마음이 놓이는 당신',
  axes: {
    authority: 82,
    urgency: 61,
    greed: 34,
    verify: 28,
  },
  description:
    '공공기관·은행·회사 이름이 붙으면 의심의 문턱이 크게 낮아지는 유형입니다. 상대가 근거를 대지 않아도 직함이나 기관명만으로 신뢰하는 경향이 있어, 사칭형 수법에 특히 취약합니다.',
  weakAgainst: ['기관 사칭 문자', '중개사·집주인 구두 약속', '전세 계약 특약 함정'],
  createdAt: '2026-07-21T13:50:00.000Z',
};
