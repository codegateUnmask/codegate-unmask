// ============================================================
// 채점 로직
//
// scoreAnswers(): answers(0~3 점수 배열) → VulnAxes(0~100 정규화)
// determineType(): VulnAxes → PROFILE_TYPES 의 typeCode
// buildProfile(): 위 둘을 합쳐 완성된 VulnProfile 반환 (API가 이 함수만 호출하면 됨)
// ============================================================

import type { VulnAxes, VulnProfile } from '../types';
import { QUESTIONS } from './questions';
import { PROFILE_TYPES } from './profileTypes';

const AXES: (keyof VulnAxes)[] = ['authority', 'urgency', 'greed', 'verify'];
const MAX_OPTION_SCORE = 3;

/**
 * answers 는 QUESTIONS 배열과 같은 길이·같은 순서여야 합니다.
 * 각 값은 해당 문항에서 고른 옵션의 score(0~3) 입니다.
 */
export function scoreAnswers(answers: number[]): VulnAxes {
  if (answers.length !== QUESTIONS.length) {
    throw new Error(
      `answers 길이가 올바르지 않습니다. 기대: ${QUESTIONS.length}, 받음: ${answers.length}`
    );
  }

  const sums: Record<keyof VulnAxes, number> = { authority: 0, urgency: 0, greed: 0, verify: 0 };
  const counts: Record<keyof VulnAxes, number> = { authority: 0, urgency: 0, greed: 0, verify: 0 };

  QUESTIONS.forEach((q, i) => {
    const raw = answers[i];
    const clamped = Math.min(Math.max(raw, 0), MAX_OPTION_SCORE);
    sums[q.axis] += clamped;
    counts[q.axis] += 1;
  });

  const axes = {} as VulnAxes;
  for (const axis of AXES) {
    const maxPossible = counts[axis] * MAX_OPTION_SCORE;
    axes[axis] = maxPossible === 0 ? 0 : Math.round((sums[axis] / maxPossible) * 100);
  }
  return axes;
}

/**
 * 4축 점수로 유형 코드를 판정합니다.
 *
 * 방어형 조건: verify(검증습관) >= 60 이고, authority/urgency/greed 평균 <= 45
 *  1) verify >= 85                         → ULTRA_SKEPTIC (만사 불신 대현자)
 *  2) 세 축(authority/urgency/greed)이      → FORTRESS (균형 잡힌 철옹성)
 *     서로 15점 이내로 고르게 낮음
 *  3) 그 외에는 가장 낮은(=가장 강한 방어)   → AUTHORITY_IMMUNE / CALM_ANCHOR /
 *     축 하나를 대표 방어 포인트로 선정        TEMPTATION_PROOF
 *
 * 취약형: 위 조건에 해당하지 않으면 authority/urgency/greed 중 최댓값 축으로 판정
 *  - 셋 다 비슷하게 중간이고 verify도 낮으면 LOW_VERIFY_DRIFTER
 */
export function determineType(axes: VulnAxes): string {
  const { authority, urgency, greed, verify } = axes;
  const avgVuln = (authority + urgency + greed) / 3;

  const isDefensive = verify >= 60 && avgVuln <= 45;

  if (isDefensive) {
    if (verify >= 85) return 'ULTRA_SKEPTIC';

    const triple = { authority, urgency, greed };
    const values = Object.values(triple);
    const spread = Math.max(...values) - Math.min(...values);

    if (spread < 15) return 'FORTRESS';

    const lowestAxis = (Object.keys(triple) as (keyof typeof triple)[]).reduce((a, b) =>
      triple[a] <= triple[b] ? a : b
    );

    if (lowestAxis === 'authority') return 'AUTHORITY_IMMUNE';
    if (lowestAxis === 'urgency') return 'CALM_ANCHOR';
    return 'TEMPTATION_PROOF';
  }

  const triple = { authority, urgency, greed };
  const values = Object.values(triple);
  const spread = Math.max(...values) - Math.min(...values);

  // 세 축이 서로 비슷하고 검증 습관도 낮으면 특정 약점이 아니라 "전반적 무방비"
  if (spread < 10 && verify < 45) return 'LOW_VERIFY_DRIFTER';

  const highestAxis = (Object.keys(triple) as (keyof typeof triple)[]).reduce((a, b) =>
    triple[a] >= triple[b] ? a : b
  );

  if (highestAxis === 'authority') return 'AUTHORITY_DOMINANT';
  if (highestAxis === 'urgency') return 'URGENCY_DOMINANT';
  return 'GREED_DOMINANT';
}

/** answers → 완성된 VulnProfile. /api/diagnose 는 이 함수 하나만 호출하면 됩니다. */
export function buildProfile(answers: number[]): VulnProfile {
  const axes = scoreAnswers(answers);
  const typeCode = determineType(axes);
  const def = PROFILE_TYPES[typeCode];

  if (!def) {
    // 방어적 fallback — 이론상 도달하지 않지만 타입 정의 누락 시 대비
    throw new Error(`알 수 없는 유형 코드: ${typeCode}`);
  }

  return {
    typeCode: def.typeCode,
    typeName: def.typeName,
    tagline: def.tagline,
    axes,
    description: def.description,
    weakAgainst: def.weakAgainst,
    createdAt: new Date().toISOString(),
    mbtiMatch: def.mbtiMatch,
    characterTitle: def.characterTitle,
    category: def.category,
    strengths: def.strengths,
  };
}
