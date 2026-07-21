// ============================================================
// 진단 채점 · 유형 판정 — [담당: 지식·프롬프트]
// TODO: 유형을 더 다양하게 늘릴 것 (지금은 축당 1개, 4개뿐 — "공유하고 싶게" 다듬기)
// ============================================================

import type { VulnAxes, VulnProfile } from '../types';
import { QUESTIONS } from './questions';

interface TypeDef {
  typeCode: string;
  typeName: string;
  tagline: string;
  description: string;
  weakAgainst: string[];
}

/** 축(verify 제외) 별 지배 유형 정의 — TODO: 조합형 유형까지 확장 */
const TYPE_DEFS: Record<Exclude<keyof VulnAxes, 'verify'>, TypeDef> = {
  authority: {
    typeCode: 'AUTHORITY_DOMINANT',
    typeName: '권위 앞에 약해지는 형',
    tagline: '"기관에서 왔다"는 말 한마디에 마음이 놓이는 당신',
    description:
      '공공기관·은행·회사 이름이 붙으면 의심의 문턱이 크게 낮아지는 유형입니다. 직함이나 기관명만으로 신뢰하는 경향이 있어 사칭형 수법에 특히 취약합니다.',
    weakAgainst: ['기관 사칭 문자', '중개사·집주인 구두 약속'],
  },
  urgency: {
    typeCode: 'URGENCY_DOMINANT',
    typeName: '시간 압박에 서두르는 형',
    tagline: '"지금 아니면 끝"이라는 말에 판단이 빨라지는 당신',
    description:
      '마감·긴급성이 강조되면 검토를 건너뛰고 결정하는 경향이 있습니다. 급전 대출, 한정 특가형 수법에 취약합니다.',
    weakAgainst: ['가계약금 선입금 유도', '한정 특가·마감 임박형 제안'],
  },
  greed: {
    typeCode: 'GREED_DOMINANT',
    typeName: '이득 유혹에 끌리는 형',
    tagline: '높은 수익률 앞에서 의심보다 기대가 앞서는 당신',
    description:
      '고수익·환급·보너스 같은 이득 제안에 판단 기준이 느슨해지는 유형입니다. 투자 리딩방, 환급 사기에 취약합니다.',
    weakAgainst: ['고수익 보장 투자 제안', '환급·리베이트 사기'],
  },
};

/** 문항 순서대로 받은 answers(각 문항의 score)를 축별로 합산해 0~100으로 정규화 */
export function scoreDiagnosis(answers: number[]): VulnProfile {
  const totals: Record<keyof VulnAxes, { sum: number; count: number }> = {
    authority: { sum: 0, count: 0 },
    urgency: { sum: 0, count: 0 },
    greed: { sum: 0, count: 0 },
    verify: { sum: 0, count: 0 },
  };

  QUESTIONS.forEach((q, i) => {
    const score = answers[i] ?? 0;
    totals[q.axis].sum += score;
    totals[q.axis].count += 1;
  });

  const axes: VulnAxes = {
    authority: totals.authority.count ? Math.round(totals.authority.sum / totals.authority.count) : 0,
    urgency: totals.urgency.count ? Math.round(totals.urgency.sum / totals.urgency.count) : 0,
    greed: totals.greed.count ? Math.round(totals.greed.sum / totals.greed.count) : 0,
    verify: totals.verify.count ? Math.round(totals.verify.sum / totals.verify.count) : 0,
  };

  // verify는 높을수록 안전(역방향)이라 지배 유형 후보에서 제외
  const dominant = (['authority', 'urgency', 'greed'] as const).reduce((max, axis) =>
    axes[axis] > axes[max] ? axis : max,
  );

  const def = TYPE_DEFS[dominant];

  return {
    typeCode: def.typeCode,
    typeName: def.typeName,
    tagline: def.tagline,
    axes,
    description: def.description,
    weakAgainst: def.weakAgainst,
    createdAt: new Date().toISOString(),
  };
}
