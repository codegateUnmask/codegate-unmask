'use client';

// 학습 진도 — [담당: 지식·데이터·인프라(D)]
// 수료한 강의 id만 저장합니다. 개인정보가 아니라 로컬에 둡니다
// (팀 CLAUDE.md §8 "꼭 저장해야 하는 것만, 비식별화해서").

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EDU_LESSONS, type EduCategory } from '@/lib/education/content';

interface EduState {
  completed: string[];
  complete: (lessonId: string) => void;
  reset: () => void;
}

export const useEduStore = create<EduState>()(
  persist(
    (set) => ({
      completed: [],
      complete: (lessonId) =>
        set((s) => (s.completed.includes(lessonId) ? s : { completed: [...s.completed, lessonId] })),
      reset: () => set({ completed: [] }),
    }),
    { name: 'clearguard-edu', storage: createJSONStorage(() => localStorage) },
  ),
);

/** 카테고리를 전부 수료했는지 — 탭에 🎓 배지를 달지 판단합니다. */
export function isCategoryDone(completed: string[], category: EduCategory): boolean {
  const inCat = EDU_LESSONS.filter((l) => l.category === category);
  return inCat.length > 0 && inCat.every((l) => completed.includes(l.id));
}
