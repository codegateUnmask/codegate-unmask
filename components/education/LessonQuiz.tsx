'use client';

// 강의 상세 + 퀴즈 — [담당: 지식·데이터·인프라(D)]
// 5문제 중 3개 이상 정답이면 수료 (pawsitive 교육센터와 같은 기준)

import { useMemo, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { QUIZ_PASS_SCORE, QUIZ_SERVE_COUNT, type EduLesson } from '@/lib/education/content';
import { serveQuiz } from '@/lib/education/shuffle';

/**
 * 본문의 **강조** 를 굵은 글씨로 바꿉니다.
 * 마크다운 라이브러리를 새로 깔지 않으려고 최소한만 처리합니다
 * (팀 CLAUDE.md §3 "새 라이브러리를 임의로 설치하지 마세요").
 */
function renderEmphasis(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-bold text-neutral-900 dark:text-neutral-100">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

interface Props {
  lesson: EduLesson;
  isCompleted: boolean;
  onPass: () => void;
  onClose: () => void;
}

export default function LessonQuiz({ lesson, isCompleted, onPass, onClose }: Props) {
  const [phase, setPhase] = useState<'read' | 'quiz' | 'result'>('read');
  // 출제 회차 — 바뀔 때마다 문제를 새로 뽑습니다(다시 풀기, 재입장).
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);

  // 문제 풀에서 매번 새로 뽑고 선지도 섞습니다.
  // 이 컴포넌트는 강의를 열 때마다 새로 마운트되므로, 나갔다 오면 자동으로 새 문제입니다.
  const quiz = useMemo(
    () => serveQuiz(lesson.quiz, QUIZ_SERVE_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- round가 바뀔 때 의도적으로 재출제
    [lesson.id, round],
  );

  const [picked, setPicked] = useState<number[]>(() => new Array(QUIZ_SERVE_COUNT).fill(-1));
  const allAnswered = picked.length === quiz.length && picked.every((p) => p >= 0);

  function grade() {
    const score = quiz.reduce((n, q, i) => (picked[i] === q.answer ? n + 1 : n), 0);
    setCorrect(score);
    setPhase('result');
    if (score >= QUIZ_PASS_SCORE) onPass();
  }

  function retry() {
    setRound((r) => r + 1); // 새 문제로 다시 출제
    setPicked(new Array(QUIZ_SERVE_COUNT).fill(-1));
    setPhase('quiz');
  }

  const passed = correct >= QUIZ_PASS_SCORE;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-3xl bg-white p-6 pb-24 sm:rounded-3xl sm:pb-6 dark:bg-neutral-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#a8b312]">
              {lesson.level === 'beginner' ? '입문' : lesson.level === 'intermediate' ? '중급' : '심화'}
              {isCompleted && ' · 수료함 🎓'}
            </p>
            <h2 className="mt-1 text-lg font-extrabold leading-snug">{lesson.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 rounded-full px-2 py-1 text-xl text-neutral-400 hover:text-neutral-700"
          >
            ×
          </button>
        </div>

        {phase === 'read' && (
          <>
            <div className="space-y-3 text-[14.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              {lesson.body.split('\n').map((line, i) =>
                line.trim() === '' ? (
                  <div key={i} className="h-1" />
                ) : (
                  <p key={i}>{renderEmphasis(line)}</p>
                ),
              )}
            </div>
            <div className="mt-6">
              <Button
                label={`퀴즈 풀기 (${QUIZ_SERVE_COUNT}문제 중 ${QUIZ_PASS_SCORE}개 이상 맞히면 수료)`}
                variant="primary"
                width="100%"
                onClick={() => setPhase('quiz')}
              />
            </div>
          </>
        )}

        {phase === 'quiz' && (
          <>
            <div className="space-y-5">
              {quiz.map((q, qi) => (
                <div key={qi}>
                  <p className="mb-2 flex gap-2 text-[15.5px] font-bold leading-snug">
                    <span className="shrink-0 text-neutral-400">Q{qi + 1}.</span>
                    <span>{q.question}</span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                          picked[qi] === oi
                            ? 'border-[#a8b312] bg-[#f4fbe3] font-semibold'
                            : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        <span
                          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                            picked[qi] === oi
                              ? 'bg-[#c8f04b] text-[#1f2412]'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          {oi + 1}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setPhase('read')}
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-bold text-neutral-600 dark:border-neutral-700"
              >
                본문 다시
              </button>
              <div className="flex-1">
                <Button
                  label={allAnswered ? '정답 확인하기' : `${picked.filter((p) => p >= 0).length}/${quiz.length} 선택됨`}
                  variant="primary"
                  width="100%"
                  isDisabled={!allAnswered}
                  onClick={grade}
                />
              </div>
            </div>
          </>
        )}

        {phase === 'result' && (
          <>
            <div
              className={`rounded-2xl p-5 text-center ${
                passed ? 'bg-[#f4fbe3]' : 'bg-amber-50 dark:bg-amber-900/20'
              }`}
            >
              <p className="text-3xl">{passed ? '🎓' : '📚'}</p>
              <p className={`mt-2 text-lg font-extrabold ${passed ? 'text-[#5f6b0a]' : 'text-amber-700'}`}>
                {correct}/{quiz.length} 정답 — {passed ? '수료!' : '조금만 더!'}
              </p>
              <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">
                {passed
                  ? '흑우에서 한 걸음 멀어졌어요.'
                  : `${QUIZ_PASS_SCORE}개 이상 맞히면 수료돼요. 본문을 다시 보고 도전해 보세요.`}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {quiz.map((q, qi) => {
                const ok = picked[qi] === q.answer;
                return (
                  <div key={qi} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                    <p className="font-semibold">
                      {ok ? '✅' : '❌'} Q{qi + 1}. {q.question}
                    </p>
                    {!ok && (
                      <p className="mt-1 text-[13px] text-neutral-500">
                        정답: {q.answer + 1}. {q.options[q.answer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-2">
              {!passed && (
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-bold text-neutral-600 dark:border-neutral-700"
                >
                  다시 풀기
                </button>
              )}
              <div className="flex-1">
                <Button label="목록으로" variant="primary" width="100%" onClick={onClose} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
