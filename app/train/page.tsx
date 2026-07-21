// ============================================================
// 학습 화면 — 흑우 탈출 훈련소 [담당: 지식·데이터·인프라(D)]
//
// 진단 결과(4축)로 학습 순서를 개인화합니다 — 컷3(개인화 연결)의 확장.
// 강의 → 퀴즈(5문제 중 3개) → 수료, 전체 수료 시 흑우가 왕관을 씁니다.
// ============================================================
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useEduStore, isCategoryDone } from '@/stores/eduStore';
import {
  EDU_CATEGORIES,
  EDU_LESSONS,
  lessonsOf,
  recommendCategories,
  type EduCategory,
  type EduLesson,
} from '@/lib/education/content';
import ProgressRunner from '@/components/education/ProgressRunner';
import LessonQuiz from '@/components/education/LessonQuiz';

const LEVEL_LABEL = { beginner: '입문', intermediate: '중급', advanced: '심화' } as const;

export default function TrainPage() {
  const profile = useAppStore((s) => s.profile);
  const completed = useEduStore((s) => s.completed);
  const complete = useEduStore((s) => s.complete);

  const [tab, setTab] = useState<EduCategory | 'all'>('all');
  const [open, setOpen] = useState<EduLesson | null>(null);

  // 진단 결과가 있으면 취약한 축의 카테고리를 앞으로 당깁니다.
  const order = useMemo(() => recommendCategories(profile?.axes), [profile]);
  const topPriority = order[0];

  const orderedCategories = useMemo(
    () => [...EDU_CATEGORIES].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)),
    [order],
  );

  const visible = useMemo(() => {
    const list = lessonsOf(tab);
    if (tab !== 'all') return list;
    // 전체 탭에서는 추천 순서대로 정렬
    return [...list].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  }, [tab, order]);

  const total = EDU_LESSONS.length;
  const doneCount = completed.filter((id) => EDU_LESSONS.some((l) => l.id === id)).length;
  const pct = Math.round((doneCount / total) * 100);

  const topCat = EDU_CATEGORIES.find((c) => c.key === topPriority);

  return (
    <main className="mx-auto w-full max-w-[560px] px-5 pb-28 pt-8">
      {/* 헤더 + 진행 게이지 */}
      <section className="rounded-3xl border border-[#e4ecc6] bg-gradient-to-b from-[#f6fbe6] to-white p-6">
        <h1 className="flex items-center gap-2 text-[22px] font-extrabold">
          {/* 이모지 대신 우리 흑우 캐릭터 (러너·커서와 같은 원화) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 장식용 소형 PNG */}
          <img src="/cow-cursor.png" alt="" className="h-8 w-8 object-contain" />
          흑우 탈출 훈련소
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          아는 만큼 안 당합니다. 강의를 읽고 퀴즈를 통과하면 수료돼요.
        </p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-xl border border-[#e4ecc6] bg-white p-2.5 text-center">
            <div className="text-xl font-extrabold text-[#a8b312]">{doneCount}</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">수료</div>
          </div>
          <div className="flex-1 rounded-xl border border-[#e4ecc6] bg-white p-2.5 text-center">
            <div className="text-xl font-extrabold text-neutral-500">{total - doneCount}</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">남은 학습</div>
          </div>
          <div className="flex-1 rounded-xl border border-[#e4ecc6] bg-white p-2.5 text-center">
            <div className="text-xl font-extrabold text-[#1f2412]">{pct}%</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">달성률</div>
          </div>
        </div>

        <ProgressRunner percent={pct} />
      </section>

      {/* 개인화 안내 */}
      {profile ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-[13px]">
            <span className="font-bold">{profile.typeName}</span>
            <span className="text-neutral-500"> 진단 결과에 맞춰 순서를 정렬했어요.</span>
          </p>
          {topCat && (
            <p className="mt-1 text-[12.5px] text-neutral-500">
              먼저 들어야 할 것:{' '}
              <span className="font-bold text-[#5f6b0a]">
                {topCat.emoji} {topCat.label}
              </span>{' '}
              — {topCat.description}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-4 text-center dark:border-neutral-700">
          <p className="text-[13px] text-neutral-500">
            취약 유형을 진단하면 <b>나에게 시급한 순서</b>로 정렬해 드려요.
          </p>
          <Link href="/diagnose" className="mt-2 inline-block text-[13px] font-bold text-[#5f6b0a] underline">
            1분 진단하러 가기 →
          </Link>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="-mx-5 mt-5 overflow-x-auto px-5 pb-1">
        <div className="flex min-w-max gap-1.5">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
              tab === 'all'
                ? 'border-[#1f2412] bg-[#1f2412] text-white'
                : 'border-neutral-200 bg-white text-neutral-600'
            }`}
          >
            전체
          </button>
          {orderedCategories.map((c, i) => {
            const done = isCategoryDone(completed, c.key);
            const isTop = Boolean(profile) && c.key === topPriority && i === 0;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setTab(c.key)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
                  tab === c.key
                    ? 'border-[#1f2412] bg-[#1f2412] text-white'
                    : 'border-neutral-200 bg-white text-neutral-600'
                }`}
              >
                {c.emoji} {c.label}
                {done ? ' 🎓' : isTop ? ' ⭐' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 강의 카드 */}
      <div className="mt-4 flex flex-col gap-2.5">
        {visible.map((l) => {
          const isDone = completed.includes(l.id);
          const cat = EDU_CATEGORIES.find((c) => c.key === l.category)!;
          const isPriority = Boolean(profile) && l.category === topPriority && !isDone;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setOpen(l)}
              className={`rounded-2xl border p-4 text-left transition ${
                isDone
                  ? 'border-[#d8e8a8] bg-[#fafdf2]'
                  : isPriority
                    ? 'border-[#a8b312] bg-white'
                    : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-neutral-400">
                <span>
                  {cat.emoji} {cat.label}
                </span>
                <span>·</span>
                <span>{LEVEL_LABEL[l.level]}</span>
                {isPriority && <span className="text-[#5f6b0a]">· ⭐ 먼저 듣기</span>}
                {isDone && <span className="ml-auto text-[#5f6b0a]">수료 🎓</span>}
              </div>
              <p className="mt-1.5 font-bold leading-snug">{l.title}</p>
              <p className="mt-1 text-[13px] text-neutral-500">{l.summary}</p>
            </button>
          );
        })}
      </div>

      {open && (
        <LessonQuiz
          lesson={open}
          isCompleted={completed.includes(open.id)}
          onPass={() => complete(open.id)}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}
