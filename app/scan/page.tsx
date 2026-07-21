'use client';

// ============================================================
// /diagnose 화면
// - 16문항 진행 → /api/diagnose 호출 → 결과 카드 렌더링
// - 결과는 localStorage('unmask_vuln_profile')에 저장 → 판독 화면(컷3)에서 재사용
// - 사이버 시큐리티 테마: 다크 배경 + 일렉트릭 그린 포인트 + 네온 레드/앰버/그린
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS } from '@/lib/diagnosis/questions';
import type { VulnAxes, VulnProfile } from '@/lib/types';

const STORAGE_KEY = 'unmask_vuln_profile';

type Step = 'intro' | 'quiz' | 'loading' | 'result' | 'error';

const AXIS_META: Record<keyof VulnAxes, { label: string; color: string; glow: string }> = {
  authority: { label: '권위 반응', color: '#ffb020', glow: 'rgba(255,176,32,0.45)' },
  urgency: { label: '시간압박 반응', color: '#ff3b56', glow: 'rgba(255,59,86,0.45)' },
  greed: { label: '이득 유혹 반응', color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  verify: { label: '검증 습관', color: '#39ff14', glow: 'rgba(57,255,20,0.45)' },
};

export default function DiagnosePage() {
  const [step, setStep] = useState<Step>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [profile, setProfile] = useState<VulnProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 이전에 진단한 결과가 있으면 표시
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        /* 무시 — 손상된 데이터면 새로 진단하면 됨 */
      }
    }
  }, []);

  const progress = useMemo(
    () => Math.round((index / QUESTIONS.length) * 100),
    [index]
  );

  function startQuiz() {
    setAnswers([]);
    setIndex(0);
    setStep('quiz');
  }

  async function submitAnswers(finalAnswers: number[]) {
    setStep('loading');
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '진단 서버 오류');
      }
      const data: VulnProfile = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setProfile(data);
      setStep('result');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류');
      setStep('error');
    }
  }

  function selectOption(score: number) {
    const next = [...answers, score];
    setAnswers(next);
    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      submitAnswers(next);
    }
  }

  function goBack() {
    if (index === 0) return;
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
  }

  function retake() {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    startQuiz();
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {step === 'intro' && !profile && <IntroCard onStart={startQuiz} />}
        {step === 'intro' && profile && (
          <ResultCard profile={profile} onRetake={retake} />
        )}
        {step === 'quiz' && (
          <QuizCard
            index={index}
            progress={progress}
            onSelect={selectOption}
            onBack={goBack}
          />
        )}
        {step === 'loading' && <LoadingCard />}
        {step === 'result' && profile && (
          <ResultCard profile={profile} onRetake={retake} />
        )}
        {step === 'error' && (
          <ErrorCard message={errorMsg} onRetry={() => setStep('quiz')} />
        )}
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// 인트로
// ------------------------------------------------------------
function IntroCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-[#39ff14]/25 bg-[#0a0e14] p-8 shadow-[0_0_40px_rgba(57,255,20,0.08)]">
      <p className="mb-2 text-xs tracking-[0.3em] text-[#39ff14] font-mono">UNMASK // DIAGNOSIS</p>
      <h1 className="mb-4 text-2xl font-bold leading-snug">
        당신의 사기 방어 유형은?
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400">
        16개의 질문으로 권위·시간압박·이득 유혹에 대한 반응과 검증 습관을 분석합니다.
        결과에는 MBTI 매칭과 캐릭터 타이틀이 함께 제공됩니다. 약 2분 소요.
      </p>
      <button
        onClick={onStart}
        className="w-full rounded-xl bg-[#39ff14] py-3 font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
      >
        진단 시작하기
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// 문항 진행
// ------------------------------------------------------------
function QuizCard({
  index,
  progress,
  onSelect,
  onBack,
}: {
  index: number;
  progress: number;
  onSelect: (score: number) => void;
  onBack: () => void;
}) {
  const q = QUESTIONS[index];
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0a0e14] p-6">
      <div className="mb-6 flex items-center justify-between text-xs font-mono text-gray-500">
        <span>
          {index + 1} / {QUESTIONS.length}
        </span>
        <span className="text-[#39ff14]">{progress}%</span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-[#39ff14] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mb-6 text-lg font-semibold leading-relaxed">{q.text}</h2>

      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(opt.score)}
            className="w-full rounded-xl border border-gray-800 bg-[#0d1219] px-4 py-3 text-left text-sm text-gray-200 transition hover:border-[#39ff14]/50 hover:bg-[#101720] active:scale-[0.99]"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {index > 0 && (
        <button
          onClick={onBack}
          className="mt-6 text-xs text-gray-500 hover:text-gray-300"
        >
          ← 이전 질문
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// 로딩
// ------------------------------------------------------------
function LoadingCard() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0a0e14] p-10 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#39ff14] border-t-transparent" />
      <p className="font-mono text-sm text-gray-400">유형 분석 중...</p>
    </div>
  );
}

// ------------------------------------------------------------
// 에러
// ------------------------------------------------------------
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-[#ff3b56]/40 bg-[#0a0e14] p-8 text-center">
      <p className="mb-4 font-mono text-sm text-[#ff3b56]">진단 실패</p>
      <p className="mb-6 text-sm text-gray-400">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-xl border border-gray-700 px-5 py-2 text-sm text-gray-200 hover:border-[#39ff14]/50"
      >
        다시 시도
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// 결과 카드 — 스크린샷 찍고 싶은 비주얼
// ------------------------------------------------------------
function ResultCard({
  profile,
  onRetake,
}: {
  profile: VulnProfile;
  onRetake: () => void;
}) {
  const isDefensive = profile.category === 'defensive';
  const accent = isDefensive ? '#39ff14' : '#ff3b56';
  const accentGlow = isDefensive ? 'rgba(57,255,20,0.25)' : 'rgba(255,59,86,0.25)';
  const list = isDefensive ? profile.strengths ?? [] : profile.weakAgainst;
  const listLabel = isDefensive ? '특히 강한 방어 포인트' : '특히 취약한 수법';

  return (
    <div id="unmask-result-card" className="space-y-4">
      <div
        className="rounded-2xl border p-7"
        style={{
          borderColor: `${accent}55`,
          background: 'linear-gradient(180deg,#0a0e14 0%,#070a0f 100%)',
          boxShadow: `0 0 45px ${accentGlow}`,
        }}
      >
        {/* 상단 배지 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.25em] text-gray-500">
            UNMASK RESULT
          </span>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
            style={{ color: accent, border: `1px solid ${accent}55`, background: `${accent}12` }}
          >
            {isDefensive ? '🛡 방어형' : '⚠ 취약형'}
          </span>
        </div>

        {/* 캐릭터 타이틀 */}
        <p className="mb-1 text-xs font-mono text-gray-500">{profile.mbtiMatch} 페르소나</p>
        <h1
          className="mb-2 text-3xl font-extrabold leading-tight"
          style={{ color: accent, textShadow: `0 0 20px ${accentGlow}` }}
        >
          {profile.characterTitle}
        </h1>
        <p className="mb-4 text-sm font-semibold text-gray-300">{profile.typeName}</p>
        <p className="mb-6 text-sm italic text-gray-400">&ldquo;{profile.tagline}&rdquo;</p>

        {/* 4축 그래프 */}
        <div className="mb-6 space-y-3">
          {(Object.keys(profile.axes) as (keyof VulnAxes)[]).map((axis) => {
            const meta = AXIS_META[axis];
            const value = profile.axes[axis];
            return (
              <div key={axis}>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{meta.label}</span>
                  <span className="font-mono" style={{ color: meta.color }}>
                    {value}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      background: meta.color,
                      boxShadow: `0 0 8px ${meta.glow}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 설명 */}
        <p className="mb-5 text-sm leading-relaxed text-gray-300">{profile.description}</p>

        {/* 취약 수법 / 방어 포인트 목록 */}
        {list.length > 0 && (
          <div className="mb-2 rounded-xl border border-gray-800 bg-[#0d1219] p-4">
            <p className="mb-2 text-xs font-bold text-gray-400">{listLabel}</p>
            <ul className="space-y-1.5">
              {list.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span style={{ color: accent }}>▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 rounded-xl border border-gray-700 py-3 text-sm text-gray-300 hover:border-[#39ff14]/50"
        >
          다시 진단하기
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 rounded-xl bg-[#39ff14] py-3 text-sm font-bold text-black hover:brightness-110"
        >
          결과 저장 / 공유
        </button>
      </div>
    </div>
  );
}