'use client';

// 프로필 표시 설정 — [담당: 지식·데이터·인프라(D)]
//
// DB가 없으므로 이 기기에만 저장합니다(localStorage).
// 서버로 올리지 않으니 "원문·개인정보 미저장" 원칙과 충돌하지 않습니다.
// 소셜 로그인 계정의 이름·사진을 덮어쓰는 것이 아니라, 화면 표시만 바꿉니다.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProfileState {
  /** 사용자가 직접 정한 표시 이름 (없으면 세션 이름 사용) */
  nickname: string | null;
  /** 프로필 사진 (data URL, 128px로 축소해 저장) */
  avatar: string | null;
  setNickname: (v: string | null) => void;
  setAvatar: (v: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      nickname: null,
      avatar: null,
      setNickname: (v) => set({ nickname: v?.trim() ? v.trim().slice(0, 20) : null }),
      setAvatar: (v) => set({ avatar: v }),
    }),
    { name: 'clearguard-profile', storage: createJSONStorage(() => localStorage) },
  ),
);

/**
 * 업로드한 이미지를 정사각 128px로 줄여 data URL로 만듭니다.
 * 원본을 그대로 담으면 localStorage 용량(약 5MB)을 금방 넘깁니다.
 */
export function toAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아닙니다'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 열지 못했습니다'));
      img.onload = () => {
        const SIZE = 128;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('캔버스를 만들지 못했습니다'));
          return;
        }
        // 가운데를 정사각으로 잘라 채웁니다 (얼굴이 잘리지 않도록 중앙 기준)
        const side = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          SIZE,
          SIZE,
        );
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
