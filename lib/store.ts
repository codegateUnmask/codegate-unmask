// ============================================================
// 클라이언트 전역 상태 (zustand) — [담당: 프론트(B)]
// 진단 결과를 판독 화면에서 재사용하기 위한 최소 store.
//
// persist(localStorage): 새로고침해도 진단 결과가 유지되게 (컷3 연결).
// 저장되는 건 비식별 취약성 유형뿐 — 팀 CLAUDE.md §8 "저장 허용 목록" 안.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { VulnProfile } from './types';

interface AppState {
  profile: VulnProfile | null;
  setProfile: (profile: VulnProfile) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'unmask-profile',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
