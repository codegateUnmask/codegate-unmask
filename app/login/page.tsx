// ============================================================
// /login — 로그인 화면 (데모 목업)  [담당: B]
// ⚠️ 실제 인증 아님: OAuth 연동 없이 로그인 UX만 시연하는 데모 모드.
//    실서비스 전환 시 카카오 OAuth(NextAuth 등) 교체 지점에 주석 표시.
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'form' | 'processing' | 'done';

const PROVIDERS = [
  { id: 'kakao', label: '카카오로 3초 만에 시작', bg: '#ffe812', fg: '#3b1e1e' },
  { id: 'naver', label: '네이버로 시작', bg: '#03c75a', fg: '#ffffff' },
  { id: 'google', label: 'Google로 시작', bg: '#ffffff', fg: '#16202c' },
] as const;

export default function LoginPage() {
  const [step, setStep] = useState<Step>('form');
  const [provider, setProvider] = useState<string>('');

  function signIn(id: string) {
    // ── 실서비스 전환 지점 ──────────────────────────────
    // 여기서 OAuth 호출로 교체: signIn('kakao') (NextAuth) 등.
    // 데모에서는 1초 처리 연출 후 완료 화면.
    // ──────────────────────────────────────────────────
    setProvider(id);
    setStep('processing');
    setTimeout(() => setStep('done'), 1000);
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6 py-12">
      {step === 'form' && (
        <div className="card-in">
          <p className="font-mono text-[13px] font-bold tracking-[0.22em] text-[var(--ink-soft)]">
            UNMASK
          </p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-snug text-[var(--ink)]">
            숨은 위험을
            <br />
            <span className="hl-brand">먼저 보는</span> 습관
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">
            로그인하면 진단 기록과 Shield Score가 이어지고,
            <br />
            판독 원문은 여전히 저장하지 않아요.
          </p>

          <div className="mt-7 space-y-2.5">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => signIn(p.id)}
                className="w-full rounded-xl border border-[var(--line)] px-5 py-3.5 text-[15px] font-extrabold transition-transform active:scale-[0.98]"
                style={{ background: p.bg, color: p.fg }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-center text-[12px] leading-relaxed text-[var(--ink-soft)]">
            데모 모드 — 실제 로그인이 이루어지지 않습니다.
            <br />
            <Link href="/scan" className="font-bold underline underline-offset-2">
              로그인 없이 판독해보기
            </Link>
          </p>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--ink)]" />
          <p className="mt-3 font-mono text-[13.5px] font-bold tracking-wider text-[var(--ink)]">
            {provider === 'kakao' ? '카카오' : provider === 'naver' ? '네이버' : 'Google'} 로그인 중…
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="card-in">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--safe)] text-[22px] font-extrabold text-white">
            ✓
          </span>
          <h2 className="mt-3 text-[22px] font-extrabold leading-snug text-[var(--ink)]">
            환영해요!
            <br />
            무엇부터 해볼까요?
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-soft)]">
            처음이라면 1분 유형 테스트부터 하면
            <br />
            판독 결과에 맞춤 경고가 붙어요.
          </p>

          {/* 선택 버튼 2개 — 접근성: 큰 터치 영역(72px+), 굵은 글씨, 화살표로 방향성 */}
          <nav className="mt-6 space-y-3" aria-label="시작할 작업 선택">
            <Link
              href="/scan"
              className="flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl bg-[var(--ink)] px-5 py-4 text-white transition-transform active:scale-[0.98]"
            >
              <span className="text-[24px]" aria-hidden>📄</span>
              <span className="flex-1 text-left">
                <strong className="block text-[16.5px] font-extrabold">계약서 분석하기</strong>
                <span className="text-[12.5px] opacity-85">전월세·근로계약·약관·문자 판독</span>
              </span>
              <span aria-hidden className="text-[18px] font-extrabold">→</span>
            </Link>
            <Link
              href="/diagnose"
              className="flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-4 text-[var(--ink)] transition-transform active:scale-[0.98]"
            >
              <span className="text-[24px]" aria-hidden>🧭</span>
              <span className="flex-1 text-left">
                <strong className="block text-[16.5px] font-extrabold">내 사기 취약 유형 테스트</strong>
                <span className="text-[12.5px] text-[var(--ink-soft)]">1분 16문항 — 판독에 맞춤 경고 연결</span>
              </span>
              <span aria-hidden className="text-[18px] font-extrabold">→</span>
            </Link>
          </nav>

          <p className="mt-4 text-center text-[12px] text-[var(--ink-soft)]">
            데모 모드 · 원문은 저장하지 않아요 ·{' '}
            <Link href="/premium" className="font-bold underline underline-offset-2">
              프리미엄 보기
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
