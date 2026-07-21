// ============================================================
// 채점 로직
//
// scoreAnswers(): answers(0~3 점수 배열) → VulnAxes(0~100 정규화)
// determineType(): VulnAxes → PROFILE_TYPES 의 typeCode (MBTI 16종)
// buildProfile(): 위 둘을 합쳐 완성된 VulnProfile 반환 (API가 이 함수만 호출하면 됨)
//
// 16유형 판정 원리:
//  4축(authority/urgency/greed/verify)을 각각 50점 기준 고(1)/저(0)로
//  나누면 2^4=16가지 조합이 나옵니다. 이 조합을 그대로 MBTI 16유형에
//  1:1 매칭했습니다 (PATTERN_TO_TYPE 참고). verify가 높으면(1) 방어형,
//  낮으면(0) 취약형이 되고, 나머지 3축의 고/저 조합이 세부 유형을 정합니다.
// ============================================================

import type { VulnAxes, VulnProfile } from '../types';
import { QUESTIONS } from './questions';
import { PROFILE_TYPES } from './profileTypes';

const AXES: (keyof VulnAxes)[] = ['authority', 'urgency', 'greed', 'verify'];
const MAX_OPTION_SCORE = 3;
const THRESHOLD = 50;

/** 비트 순서: authority, urgency, greed, verify → 문자열 키(예: '1010') */
const PATTERN_TO_TYPE: Record<string, string> = {
  // 취약형 (verify = 0)
  '0000': 'INFP', // 전부 낮음, 검증도 없음 → 무기력 방관자형
  '0010': 'ENFP', // 이득만 높음
  '0100': 'ESFP', // 시간압박만 높음
  '0110': 'ESTP', // 시간압박+이득
  '1000': 'ISFJ', // 권위만 높음
  '1010': 'ESFJ', // 권위+이득
  '1100': 'ENFJ', // 권위+시간압박
  '1110': 'ISFP', // 셋 다 높음 → 총체적 무방비형

  // 방어형 (verify = 1)
  '0001': 'ISTJ', // 전부 낮음 + 검증 높음 → 철옹성
  '0011': 'ENTJ', // 이득만 남은 빈틈
  '0101': 'ESTJ', // 시간압박만 남은 빈틈
  '0111': 'ENTP', // 시간압박+이득 빈틈
  '1001': 'INTJ', // 권위만 남은 빈틈
  '1011': 'INFJ', // 권위+이득 빈틈
  '1101': 'INTP', // 권위+시간압박 빈틈
  '1111': 'ISTP', // 셋 다 높지만 검증으로 버팀
};

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

/** 4축 점수 → 16유형(MBTI 코드) 판정 */
// 특수 유형 '전설의 흑우형' 경계값 —
// 취약 3축이 전부 매우 높고(>=75) 검증이 매우 낮으면(<=25) 16조합보다 먼저 판정합니다.
// 4문항×3점=12점 만점 기준 75점 = 9점 이상, 25점 = 3점 이하라 실제로 도달 가능하며,
// 같은 답이면 항상 같은 결과가 나옵니다(순수 임계값 판정, 랜덤 없음).
//
// ⚠️ 이 블록이 사라지면 profileTypes.ts 의 HEUKWOO 정의가 살아 있어도
//    17번째 유형에 영원히 도달할 수 없습니다. 머지 시 유실 주의.
const EXTREME_HIGH = 75;
const EXTREME_LOW = 25;

export function determineType(axes: VulnAxes): string {
  if (
    axes.authority >= EXTREME_HIGH &&
    axes.urgency >= EXTREME_HIGH &&
    axes.greed >= EXTREME_HIGH &&
    axes.verify <= EXTREME_LOW
  ) {
    return 'HEUKWOO';
  }

  const bit = (v: number) => (v >= THRESHOLD ? '1' : '0');
  const key = `${bit(axes.authority)}${bit(axes.urgency)}${bit(axes.greed)}${bit(axes.verify)}`;
  const typeCode = PATTERN_TO_TYPE[key];

  if (!typeCode) {
    // 이론상 16개 조합을 모두 정의했으므로 도달하지 않지만, 방어적으로 처리
    throw new Error(`매칭되는 유형이 없습니다 (pattern: ${key})`);
  }
  return typeCode;
}

/** answers → 완성된 VulnProfile. /api/diagnose 는 이 함수 하나만 호출하면 됩니다. */
export function buildProfile(answers: number[]): VulnProfile {
  const axes = scoreAnswers(answers);
  const typeCode = determineType(axes);
  const def = PROFILE_TYPES[typeCode];

  if (!def) {
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
    characterTitle: def.characterTitle,
    category: def.category,
    strengths: def.strengths,
  };
}
