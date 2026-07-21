// mock 인증 — 실제 OAuth 없음. Google 버튼 클릭 시 고정 데모 유저로 로그인된다.
'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface MockUser {
  name: string;
  email: string;
}

interface AuthState {
  user: MockUser | null;
  signIn: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: () => set({ user: { name: '데모 사용자', email: 'unmask.demo@gmail.com' } }),
      signOut: () => set({ user: null }),
    }),
    { name: 'unmask-auth', storage: createJSONStorage(() => localStorage) },
  ),
);
