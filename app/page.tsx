import Link from 'next/link';
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6">
      <p className="font-mono text-[14px] font-bold tracking-[0.22em] text-[var(--ink-soft)]">UNMASK</p>
      <h1 className="mt-2 text-[44px] font-extrabold leading-[1.2] text-[var(--ink)]">
        사기의 <span className="hl-brand">가면</span>을<br />벗기는 AI
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--ink-soft)]">
        낯선 계약서와 문자에 숨은 위험을 근거와 함께 드러냅니다.
      </p>
      <Link href="/scan" className="mt-8 rounded-xl bg-[var(--ink)] px-6 py-3.5 text-[16px] font-extrabold text-white">
        계약서 판독하기
      </Link>
    </main>
  );
}
