// ============================================================
// 진단 화면 (데모 컷1) — [담당: 프론트(B) + 지식·프롬프트(C)]
// 문항 → 결과 카드. 결과는 zustand store에 저장해 /scan에서 재사용합니다 (컷3 연결).
// ============================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { VulnProfile } from '@/lib/types';
import { QUESTIONS } from '@/lib/diagnosis/questions';
import { useAppStore } from '@/lib/store';

export default function DiagnosePage() {
  const setProfile = useAppStore((s) => s.setProfile);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [result, setResult] = useState<VulnProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const answered = answers.filter((a) => a >= 0).length;

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const profile = (await res.json()) as VulnProfile;
      setResult(profile);
      setProfile(profile);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="w-full rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">당신의 사기 취약 유형은</p>
          <h2 className="my-2 text-2xl font-bold">{result.typeName}</h2>
          <p className="text-neutral-600 dark:text-neutral-400">{result.tagline}</p>
          <p className="mt-4 text-sm text-neutral-500">{result.description}</p>
        </div>
        <Link
          href="/scan"
          className="rounded-full bg-neutral-900 px-6 py-3 text-white dark:bg-white dark:text-neutral-900"
        >
          내 유형 맞춤 계약서 판독하러 가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold">나는 어떤 사기에 약할까?</h1>

      <div className="space-y-6">
        {QUESTIONS.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 font-medium">{q.text}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => prev.map((a, i) => (i === qi ? opt.score : a)))
                  }
                  className={`rounded-lg border px-4 py-2 text-left text-sm ${
                    answers[qi] === opt.score
                      ? 'border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-900'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={answered < QUESTIONS.length || loading}
        className="self-start rounded-full bg-neutral-900 px-6 py-3 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
      >
        {loading ? '분석 중…' : '결과 보기'}
      </button>
    </main>
  );
}
