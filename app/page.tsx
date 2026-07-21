import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">unmask</h1>
        <p className="text-lg text-neutral-500">
          계약서와 문자에 숨은 위험을, AI가 근거와 함께 벗겨냅니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/diagnose"
          className="rounded-full bg-neutral-900 px-6 py-3 text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          내 사기 취약 유형 진단하기
        </Link>
        <Link
          href="/scan"
          className="rounded-full border border-neutral-300 px-6 py-3 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          계약서 판독하기
        </Link>
      </div>
    </main>
  );
}
