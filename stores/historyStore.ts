'use client';

// 판독 기록 — [담당: 지식·데이터·인프라(D)]
// 판독이 끝난 ScanResult를 이 기기(localStorage)에만 남깁니다.
// 서버에는 아무것도 저장하지 않습니다 — "원본 미저장" 원칙을 기록 기능까지 관철.
// 원문 입력 텍스트는 저장하지 않고, 마스킹된 인용(quote)이 포함된 결과만 남깁니다.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DocType, ScanResult } from '@/lib/types';

export interface ScanRecord {
  id: string;
  /** 판독 완료 시각 (epoch ms) */
  ts: number;
  docType: DocType;
  result: ScanResult;
}

/** localStorage 용량 보호 — 기록은 최근 20건까지만 유지 */
const MAX_RECORDS = 20;

interface HistoryState {
  records: ScanRecord[];
  add: (docType: DocType, result: ScanResult) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      add: (docType, result) =>
        set((s) => ({
          records: [
            {
              id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
              ts: Date.now(),
              docType,
              result,
            },
            ...s.records,
          ].slice(0, MAX_RECORDS),
        })),
      remove: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
      clear: () => set({ records: [] }),
    }),
    { name: 'clearguard-history', storage: createJSONStorage(() => localStorage) },
  ),
);
