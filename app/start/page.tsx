// ============================================================
// /start — 로그인 이후 첫 화면: 무엇을 할지 선택  [담당: B]
// 팀장의 로그인 완료 시 이 페이지로 이동시키면 됨: router.push('/start')
// 로그인 없이 직접 진입해도 동작(독립 페이지).
// ============================================================

'use client';

import Link from 'next/link';

const CHOICES = [
  {
    href: '/scan',
    emoji: '📄',
    title: '계약서 분석하기',
    desc: '전월세 · 근로계약 · 헬스장 회원권 · 약관 · 문자 판독',
    primary: true,
  },
  {
    href: '/diagnose',
    emoji: '🧭',
    title: '내 사기 취약 유형 테스트',
    desc: '1분 16문항 — 판독 결과에 맞춤 경고가 붙어요',
    primary: false,
  },
] as const;

export default function StartPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6 py-12">
      <p className="font-mono text-[13px] font-bold tracking-[0.22em] text-[var(--ink-soft)]">
        클리어가드
      </p>
      <h1 className="mt-1 text-[24px] font-extrabold leading-snug text-[var(--ink)]">
        무엇부터 해볼까요?
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-soft)]">
        처음이라면 유형 테스트부터 —
        <br />
        판독 결과에 나에게 맞는 경고가 붙어요.
      </p>

      {/* 접근성: 터치 영역 76px+, 굵은 제목, aria-label, 명확한 대비 */}
      <nav className="mt-7 space-y-3" aria-label="시작할 작업 선택">
        {CHOICES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={
              c.primary
                ? 'flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl bg-[var(--ink)] px-5 py-4 text-white transition-transform active:scale-[0.98]'
                : 'flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-4 text-[var(--ink)] transition-transform active:scale-[0.98]'
            }
          >
            <span className="text-[24px]" aria-hidden>
              {c.emoji}
            </span>
            <span className="flex-1 text-left">
              <strong className="block text-[16.5px] font-extrabold">{c.title}</strong>
              <span className={c.primary ? 'text-[12.5px] opacity-85' : 'text-[12.5px] text-[var(--ink-soft)]'}>
                {c.desc}
              </span>
            </span>
            <span aria-hidden className="text-[18px] font-extrabold">
              →
            </span>
          </Link>
        ))}
      </nav>

      <p className="mt-5 text-center text-[12px] text-[var(--ink-soft)]">
        원문은 저장하지 않아요 ·{' '}
        <Link href="/premium" className="font-bold underline underline-offset-2">
          프리미엄 보기
        </Link>
      </p>
    </main>
  );
}
