// ============================================================
// [B 담당] 판독 화면 상태 (zustand).
// A의 2단계 스트림(triage→full)을 받아 화면 상태로 반영.
// triage 결과를 먼저 보여주고, full이 오면 통째로 교체(정밀본).
// ============================================================

'use client';

import { create } from 'zustand';
import { scanStream } from '@/lib/sse';
import { MAX_INPUT_CHARS } from '@/lib/config';
import type { Sample } from '@/lib/mock.scan';
import type { AnalysisStage, DocType, ScanResult, VulnProfile } from '@/lib/types';

type Status = 'idle' | 'triage' | 'full' | 'done' | 'error';

interface ScanState {
  text: string;
  docType: DocType;
  srcText: string;
  activeSample: Sample | null;
  status: Status;
  stage: AnalysisStage | null;
  result: ScanResult | null;
  error: string | null;
  setText: (t: string) => void;
  setDocType: (d: DocType) => void;
  applySample: (s: Sample) => void;
  start: (profile?: VulnProfile) => Promise<void>;
  reset: () => void;
}

let controller: AbortController | null = null;

export const useScanStore = create<ScanState>((set, get) => ({
  text: '',
  docType: 'lease',
  srcText: '',
  activeSample: null,
  status: 'idle',
  stage: null,
  result: null,
  error: null,

  setText: (text) => set({ text: text.slice(0, MAX_INPUT_CHARS), activeSample: null }),
  setDocType: (docType) => set({ docType, activeSample: null }),
  applySample: (sample) => set({ text: sample.text, activeSample: sample }),

  reset: () => {
    controller?.abort();
    set({ status: 'idle', stage: null, result: null, error: null });
  },

  start: async (profile) => {
    const { text, docType, status, activeSample } = get();
    if (status === 'triage' || status === 'full' || !text.trim()) return;

    controller?.abort();
    controller = new AbortController();
    set({ status: 'triage', stage: null, result: null, error: null, srcText: text });

    try {
      await scanStream(
        { text, docType, profile },
        (e) => {
          // full 결과가 triage를 덮어씀 (정밀본 우선)
          set({ stage: e.stage, result: e.result, status: e.stage === 'full' ? 'full' : 'triage' });
        },
        controller.signal,
        activeSample ?? undefined,
      );
      set((s) => ({ status: s.result ? 'done' : 'error', error: s.result ? null : '판독 결과가 없습니다.' }));
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      set({ status: 'error', error: '연결이 끊어졌어요. 다시 시도해주세요.' });
    }
  },
}));
