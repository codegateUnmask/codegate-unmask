// ============================================================
// 클라이언트 전역 상태 (zustand) — [담당: 프론트(B)]
// 진단 결과를 판독 화면에서 재사용하기 위한 최소 store.
//
// persist(localStorage): 새로고침해도 진단 결과가 유지되게 (컷3 연결).
// 저장되는 건 비식별 취약성 유형뿐 — 팀 CLAUDE.md §8 "저장 허용 목록" 안.
//
// profileOwner: 진단 결과를 "누가" 만들었는지.
//   localStorage는 기기 단위라, 예전에 이 브라우저에서 진단한 결과가
//   새로 로그인한 다른 계정의 /me 에 그대로 떠버리는 문제가 있었습니다.
//   'anon' = 비로그인 상태에서 진단 / 그 외 = 로그인 계정의 식별키.
//   소유자 판정·정리는 components/auth/ProfileScopeSync.tsx 가 합니다.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { VulnProfile } from './types';

interface AppState {
  profile: VulnProfile | null;
  profileOwner: string | null; // 'anon' | 계정 식별키
  setProfile: (profile: VulnProfile, owner: string) => void;
  adoptProfile: (owner: string) => void; // 방금 진단→로그인 흐름에서 이어받기
  clearProfile: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      profileOwner: null,
      setProfile: (profile, owner) => set({ profile, profileOwner: owner }),
      adoptProfile: (owner) => set({ profileOwner: owner }),
      clearProfile: () => set({ profile: null, profileOwner: null }),
    }),
    {
      name: 'unmask-profile',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
