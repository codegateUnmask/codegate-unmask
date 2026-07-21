// ============================================================
// 진단 화면 (데모 컷1) — [담당: 프론트(B) + 지식·프롬프트(C)]
// 문항 → 결과 카드. 결과는 zustand store에 저장해 /scan에서 재사용합니다 (컷3 연결).
// ============================================================
'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { SelectableCard } from '@astryxdesign/core/SelectableCard';
import type { VulnAxes, VulnProfile } from '@/lib/types';
import { QUESTIONS } from '@/lib/diagnosis/questions';
import { useAppStore } from '@/lib/store';

// 4축 그래프 라벨 — verify만 "높을수록 안전"인 역방향 축이라 색을 달리 칠한다
const AXIS_LABELS: { key: keyof VulnAxes; label: string; safe: boolean }[] = [
  { key: 'authority', label: '권위에 약한 정도', safe: false },
  { key: 'urgency', label: '재촉에 약한 정도', safe: false },
  { key: 'greed', label: '이득 유혹에 약한 정도', safe: false },
  { key: 'verify', label: '검증 습관 (높을수록 안전)', safe: true },
];

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
    const isDefensive = result.category === 'defensive';
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="w-full rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          {/* 분류 배지 + MBTI 칩 */}
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isDefensive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}
            >
              {isDefensive ? '🛡️ 방어형' : '⚠️ 취약형'}
            </span>
            {result.mbtiMatch && (
              <span className="rounded-full border border-neutral-300 px-3 py-1 font-mono text-xs font-bold text-neutral-500 dark:border-neutral-700">
                {result.mbtiMatch}
              </span>
            )}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- 16종 캐릭터마다 원본 크기가 달라 next/image의 고정 width/height 요건과 안 맞음 */}
          <img
            src={`/${result.typeCode}.png`}
            alt={`${result.characterTitle ?? result.typeName} 캐릭터`}
            className="mx-auto mt-4 h-40 w-40 object-contain"
          />

          <p className="mt-4 text-center text-sm text-neutral-500">당신의 사기 취약 유형은</p>
          <h2 className="my-1 text-center text-2xl font-bold">{result.typeName}</h2>
          {result.characterTitle && (
            <p className="text-center text-sm font-semibold text-neutral-500">
              — {result.characterTitle} —
            </p>
          )}
          <p className="mt-2 text-center text-neutral-600 dark:text-neutral-400">{result.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">{result.description}</p>

          {/* 4축 그래프 */}
          <div className="mt-6 space-y-2.5">
            {AXIS_LABELS.map(({ key, label, safe }) => (
              <div key={key}>
                <div className="mb-0.5 flex justify-between text-xs text-neutral-500">
                  <span>{label}</span>
                  <span className="font-mono font-bold">{result.axes[key]}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-2 rounded-full ${safe ? 'bg-emerald-500' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min(100, Math.max(0, result.axes[key]))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 취약 수법 / 방어 강점 */}
          {result.weakAgainst.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                이런 수법에 특히 조심하세요
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                {result.weakAgainst.map((w) => (
                  <li key={w}>· {w}</li>
                ))}
              </ul>
            </div>
          )}
          {(result.strengths?.length ?? 0) > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                이런 방어에 강해요
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                {result.strengths!.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button label="내 유형 맞춤 계약서 판독하러 가기" variant="primary" size="lg" href="/scan" />
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
                <SelectableCard
                  key={oi}
                  label={opt.label}
                  isSelected={answers[qi] === opt.score}
                  onChange={() =>
                    setAnswers((prev) => prev.map((a, i) => (i === qi ? opt.score : a)))
                  }
                  padding={2}
                >
                  <span className="text-sm">{opt.label}</span>
                </SelectableCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="self-start">
        <Button
          label={loading ? '분석 중…' : '결과 보기'}
          variant="primary"
          size="lg"
          isDisabled={answered < QUESTIONS.length}
          isLoading={loading}
          onClick={handleSubmit}
        />
      </div>
    </main>
  );
}
