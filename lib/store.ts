// ============================================================
// 클라이언트 전역 상태 (zustand) — [담당: 프론트(B)]
// 진단 결과를 판독 화면에서 재사용하기 위한 최소 store.
// ============================================================

import { create } from 'zustand';
import type { VulnProfile } from './types';

interface AppState {
  profile: VulnProfile | null;
  setProfile: (profile: VulnProfile) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
