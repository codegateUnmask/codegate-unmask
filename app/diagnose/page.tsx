// ============================================================
// 진단 화면 (데모 컷1) — [담당: 프론트(B) + 지식·프롬프트(C)]
// 문항 → 결과 카드. 결과는 zustand store에 저장해 /scan에서 재사용합니다 (컷3 연결).
// ============================================================
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '@astryxdesign/core/Button';
import { SelectableCard } from '@astryxdesign/core/SelectableCard';
import type { VulnAxes, VulnProfile } from '@/lib/types';
import { QUESTIONS } from '@/lib/diagnosis/questions';
import { useAppStore } from '@/lib/store';
import { ANON_OWNER, FRESH_DIAGNOSIS_KEY, identityKey } from '@/components/auth/identity';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';
import { profileToShareUrl } from '@/lib/share';
import { renderResultCard } from '@/lib/diagnosis/resultCard';

// 4축 그래프 라벨 — verify만 "높을수록 안전"인 역방향 축이라 색을 달리 칠한다
const AXIS_LABELS: { key: keyof VulnAxes; label: string; safe: boolean }[] = [
  { key: 'authority', label: '권위에 약한 정도', safe: false },
  { key: 'urgency', label: '재촉에 약한 정도', safe: false },
  { key: 'greed', label: '이득 유혹에 약한 정도', safe: false },
  { key: 'verify', label: '검증 습관 (높을수록 안전)', safe: true },
];

export default function DiagnosePage() {
  const { data: session } = useSession();
  const setProfile = useAppStore((s) => s.setProfile);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [result, setResult] = useState<VulnProfile | null>(null);
  const [loading, setLoading] = useState(false);
  // step: -1 인트로, 0~15 문항, QUESTIONS.length 제출(분석 중)
  const [step, setStep] = useState(-1);
  const [dir, setDir] = useState(1);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 토스트는 2.5초 뒤 사라집니다
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

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
      // 로그인 상태면 그 계정 소유로, 아니면 이 기기(anon) 소유로 저장.
      // anon일 땐 "방금 진단함" 플래그를 남겨, 이어서 로그인하면 결과를 이어받게 합니다.
      const owner = identityKey(session) ?? ANON_OWNER;
      setProfile(profile, owner);
      if (owner === ANON_OWNER) sessionStorage.setItem(FRESH_DIAGNOSIS_KEY, '1');
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(qi: number, score: number) {
    setAnswers((prev) => prev.map((a, i) => (i === qi ? score : a)));
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(
      () => {
        setDir(1);
        setStep(qi + 1);
      },
      reduced ? 0 : 250,
    );
  }

  function goBack() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDir(-1);
    setStep((s) => s - 1);
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (step === QUESTIONS.length && !result) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  async function handleShare() {
    if (!result) return;
    const text = `[ClearGuard 사기 취약 유형 진단]
나는 「${result.typeName}」 — ${result.tagline}
1분 진단하기: ${profileToShareUrl(result)}`;

    // 모바일에서는 공유 시트가 자연스럽지만, 데스크톱에서는 공유 시트에
    // "복사"가 없어서 아무 일도 안 일어난 것처럼 보입니다.
    // → 터치 기기에서만 공유 시트, 그 외에는 클립보드 복사.
    const isTouch =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title: 'ClearGuard 유형 진단', text });
        return;
      } catch {
        /* 사용자가 시트를 닫음 — 아래 복사로 폴백 */
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setToast('결과가 복사됐어요! 원하는 곳에 붙여넣으세요.');
    } catch {
      // 클립보드 권한이 없는 경우까지 대비 (구형 브라우저·비보안 컨텍스트)
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      setToast(ok ? '결과가 복사됐어요!' : '복사에 실패했어요. 화면을 캡처해 주세요.');
    }
  }

  /** 결과 카드를 PNG 파일로 저장합니다 — 항상 다운로드(공유 시트 아님). */
  async function handleSaveImage() {
    if (!result || saving) return;
    setSaving(true);
    try {
      const blob = await renderResultCard(result);
      if (!blob) {
        setToast('이미지를 만들지 못했어요. 화면 캡처를 이용해 주세요.');
        return;
      }
      // ⚠️ navigator.share 로 보내면 데스크톱에서 "저장"이 없는 공유 시트가 떠서
      //    파일이 저장되지 않습니다. 버튼 이름이 '저장'이므로 항상 다운로드합니다.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clearguard-${result.typeCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 브라우저가 다운로드를 시작할 시간을 준 뒤 해제
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast('이미지를 저장했어요. 다운로드 폴더를 확인해 주세요.');
    } catch (e) {
      setToast('저장에 실패했어요. 화면 캡처를 이용해 주세요.');
      console.error('[diagnose] 결과 카드 저장 실패:', e instanceof Error ? e.name : typeof e);
    } finally {
      setSaving(false);
    }
  }

  function handleRetake() {
    setResult(null);
    setAnswers(new Array(QUESTIONS.length).fill(-1));
    setStep(-1);
    window.scrollTo({ top: 0 });
  }

  if (result) {
    const isDefensive = result.category === 'defensive';
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        {/* 저장·복사 결과 안내 — 눌렀는데 아무 반응이 없으면 실패한 줄 압니다 */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900/92 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          >
            {toast}
          </div>
        )}
        <div className="w-full rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          {/* 분류 배지 */}
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
        {/* 주 버튼은 한 줄 전폭, 보조 버튼 3개는 가로로 균등 분할 —
            셋을 한 줄에 욱여넣으면 "결과 공\n유하기"처럼 어색하게 끊깁니다. */}
        <div className="flex w-full flex-col gap-2">
          <Button
            label="내 유형 맞춤 계약서 판독하러 가기"
            variant="primary"
            size="lg"
            width="100%"
            href="/scan"
          />
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="whitespace-nowrap rounded-xl border border-neutral-300 px-2 py-3 text-sm font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              공유하기
            </button>
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={saving}
              className="whitespace-nowrap rounded-xl border border-neutral-300 px-2 py-3 text-sm font-bold text-neutral-700 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
            >
              {saving ? '저장 중…' : '이미지 저장'}
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="whitespace-nowrap rounded-xl border border-neutral-300 px-2 py-3 text-sm font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              다시 검사
            </button>
          </div>
          <Button label="내 유형 맞춤 학습 시작하기" variant="secondary" width="100%" href="/train" />
        </div>
      </main>
    );
  }

  const q = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null;
  const slide = reduced ? 0 : 48;
  const variants = {
    enter: (d: number) => ({ x: d * slide, opacity: reduced ? 1 : 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -slide, opacity: reduced ? 1 : 0 }),
  };

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-6">
      {q && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="이전으로"
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--color-text-secondary)]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--color-text-secondary)]">
            {step + 1} / {QUESTIONS.length}
          </span>
        </div>
      )}

      <div className="relative flex min-h-[68dvh] flex-col justify-center">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}
            className="w-full"
          >
            {step === -1 && (
              <div className="flex flex-col items-start gap-6">
                <div>
                  {/* 시작 화면이 비어 보여 브랜드를 얹었습니다 (판독 화면 헤더와 같은 로고) */}
                  <div className="mb-5">
                    <ClearGuardLogo size={30} />
                  </div>
                  <h1 className="text-[28px] font-bold leading-snug">
                    나는 어떤 사기에
                    <br />
                    약할까?
                  </h1>
                  <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    16문항 · 약 1분
                  </p>
                </div>
                <ul className="space-y-2 text-[15px] text-[var(--color-text-primary)]">
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true">🃏</span>
                    <span>내 사기 취약 유형 카드를 받아요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true">🎯</span>
                    <span>계약서 판독 결과에 맞춤 경고가 붙어요</span>
                  </li>
                </ul>
                <Button
                  label="시작하기"
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setDir(1);
                    setStep(0);
                  }}
                />
              </div>
            )}

            {q && (
              <>
                <p className="text-[19px] font-semibold leading-relaxed text-[var(--color-text-primary)]">
                  {q.text}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {q.options.map((opt, oi) => (
                    <SelectableCard
                      key={oi}
                      label={opt.label}
                      isSelected={answers[step] === opt.score}
                      onChange={() => handleSelect(step, opt.score)}
                      padding={2}
                    >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-primary)]">
                        <span
                          aria-hidden="true"
                          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                            answers[step] === opt.score
                              ? 'bg-[var(--color-accent,#c8f04b)] text-[#1f2412]'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {oi + 1}
                        </span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectableCard>
                  ))}
                </div>
              </>
            )}

            {step === QUESTIONS.length && (
              <p className="text-center text-lg font-semibold text-[var(--color-text-secondary)]">
                {loading ? '결과 분석 중…' : '결과 정리 중…'}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
