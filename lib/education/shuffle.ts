// 퀴즈 출제 — [담당: 지식·데이터·인프라(D)]
//
// pawsitive 교육센터와 같은 방식: 문제 풀에서 매번 다시 뽑고 선지도 섞습니다.
// 같은 문제가 같은 순서로 나오면 답 위치를 외워서 통과하게 되어 학습이 안 됩니다.
//
// ⚠️ 진단(scoring.ts)의 결정성과는 별개입니다.
//    진단은 "같은 답 → 같은 유형"이어야 하지만,
//    퀴즈는 매 시도마다 새로 뽑히는 것이 맞습니다.

import type { QuizItem } from './content';

/** 화면에 뿌릴 문제 — 선지가 섞이면서 정답 인덱스도 함께 옮겨집니다. */
export interface ServedQuiz {
  question: string;
  options: string[];
  answer: number;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 문제 풀에서 count개를 뽑고, 각 문제의 선지도 섞습니다.
 * 풀이 count보다 작으면 있는 만큼만 냅니다.
 */
export function serveQuiz(pool: QuizItem[], count: number): ServedQuiz[] {
  return shuffled(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => {
      const correctText = q.options[q.answer];
      const options = shuffled(q.options);
      return {
        question: q.question,
        options,
        // 섞인 뒤 정답이 어디로 갔는지 텍스트로 다시 찾습니다.
        answer: options.indexOf(correctText),
      };
    });
}
