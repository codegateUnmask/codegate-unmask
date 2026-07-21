// 진단 채점 회귀 테스트 — [담당: 지식·데이터·인프라(D)]
//
// 왜 있는가:
//   PR #137(MBTI 코드 노출 제거) 머지 과정에서 scoring.ts 의
//   '전설의 흑우형' 판정 블록이 통째로 사라진 적이 있습니다.
//   profileTypes.ts 에 정의는 남아 있어서 빌드도 통과하고 화면도 멀쩡했지만,
//   17번째 유형에 영원히 도달할 수 없는 상태였습니다.
//   → 데이터와 로직이 따로 놀 수 있으므로 "도달 가능한가"를 테스트로 고정합니다.

import assert from 'node:assert';
import { QUESTIONS } from './questions';
import { PROFILE_TYPES } from './profileTypes';
import { buildProfile, determineType, scoreAnswers } from './scoring';

/** 축별 문항 인덱스 */
const idx: Record<string, number[]> = { authority: [], urgency: [], greed: [], verify: [] };
QUESTIONS.forEach((q, i) => idx[q.axis].push(i));

function answersFor(scores: Record<string, number>): number[] {
  const a = new Array(QUESTIONS.length).fill(0);
  for (const [axis, score] of Object.entries(scores)) for (const i of idx[axis]) a[i] = score;
  return a;
}

// ── ① 전설의 흑우형에 실제로 도달할 수 있어야 한다 ──────────────
{
  const extreme = buildProfile(answersFor({ authority: 3, urgency: 3, greed: 3, verify: 0 }));
  assert.equal(
    extreme.typeCode,
    'HEUKWOO',
    '취약 3축 최대 + 검증 최소인데 흑우형이 아닙니다 — determineType의 특수 판정이 사라졌을 수 있습니다',
  );
  assert.ok(PROFILE_TYPES.HEUKWOO, 'HEUKWOO 정의가 profileTypes에 없습니다');
}

// ── ② 경계값: 조금만 완화되면 일반 16유형으로 내려와야 한다 ──────
{
  // authority를 전부 2점으로 = 8/12 = 67점 → 흑우 조건(>=75) 미달
  const border = answersFor({ authority: 2, urgency: 3, greed: 3, verify: 0 });
  const axes = scoreAnswers(border);
  assert.ok(axes.authority < 75 && axes.authority >= 50, `경계 케이스 설정 오류: authority=${axes.authority}`);
  const code = determineType(axes);
  assert.notEqual(code, 'HEUKWOO', '흑우 임계값 미달인데도 흑우형이 나왔습니다');
  assert.equal(code, 'ISFP', '흑우 미달 시 총체적 무방비형으로 내려와야 합니다');
}

// ── ③ 17유형 전부 도달 가능해야 한다 ───────────────────────────
{
  const reached = new Set<string>();
  reached.add(determineType(scoreAnswers(answersFor({ authority: 3, urgency: 3, greed: 3, verify: 0 }))));
  // 고=2(67점) / 저=1(33점) 조합으로 16가지 — 흑우 임계값을 피해 일반 조합만 훑습니다
  for (let mask = 0; mask < 16; mask++) {
    reached.add(
      determineType(
        scoreAnswers(
          answersFor({
            authority: mask & 8 ? 2 : 1,
            urgency: mask & 4 ? 2 : 1,
            greed: mask & 2 ? 2 : 1,
            verify: mask & 1 ? 2 : 1,
          }),
        ),
      ),
    );
  }
  assert.equal(reached.size, 17, `도달 가능한 유형이 ${reached.size}개입니다 (17개여야 합니다)`);

  // 정의된 유형과 도달 가능한 유형이 일치해야 합니다
  const defined = Object.keys(PROFILE_TYPES).length;
  assert.equal(defined, 17, `정의된 유형이 ${defined}개입니다 (17개여야 합니다)`);
}

// ── ④ 결정성: 같은 답이면 항상 같은 결과 ───────────────────────
{
  const fixed = answersFor({ authority: 3, urgency: 1, greed: 2, verify: 1 });
  const first = determineType(scoreAnswers(fixed));
  for (let i = 0; i < 200; i++) {
    assert.equal(determineType(scoreAnswers(fixed)), first, '같은 답인데 결과가 달라졌습니다');
  }
}

// ── ⑤ 모든 유형 정의에 필수 필드가 있어야 한다 ─────────────────
{
  for (const [code, def] of Object.entries(PROFILE_TYPES)) {
    assert.ok(def.typeName, `${code}: typeName 없음`);
    assert.ok(def.tagline, `${code}: tagline 없음`);
    assert.ok(def.description, `${code}: description 없음`);
    assert.ok(def.category === 'vulnerable' || def.category === 'defensive', `${code}: category 이상`);
  }
}

console.log('diagnosis scoring checks passed');
