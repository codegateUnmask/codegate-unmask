// ============================================================
// /diagnose/shared — 공유 링크 수신자용 결과 페이지 — [담당: 프론트(B) + 진단(C)]
//
// URL의 d 파라미터만으로 친구의 결과 카드를 재현하고,
// "나도 진단해보기" CTA로 유입시킵니다 (데모 컷1의 바이럴 루프).
// 미들웨어 보호 대상(/scan)이 아니므로 로그인 없이 열립니다 — 유입 경로 정책과 정합.
// 서버 컴포넌트: 카톡·SNS 미리보기(OG)가 유형명 + 캐릭터 이미지로 나갑니다.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { decodeSharePayload } from '@/lib/share';
import SharedProfileCard from '@/components/share/SharedProfileCard';

type Props = { searchParams: Promise<{ d?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const p = decodeSharePayload(d);
  if (!p) return {};
  return {
    title: `나는 "${p.n}" | ClearGuard`,
    description: `${p.t ?? '내 사기 취약 유형을 확인했어요.'} 당신은 어떤 유형일까요? 1분 만에 진단해보세요.`,
    openGraph: {
      title: `나는 "${p.n}"${p.ct ? ` — ${p.ct}` : ''}`,
      description: '나는 어떤 사기에 약할까? ClearGuard에서 1분 만에 진단해보기 →',
      images: [{ url: `/${p.c}.png`, width: 512, height: 512 }],
    },
  };
}

export default async function SharedResultPage({ searchParams }: Props) {
  const { d } = await searchParams;
  const p = decodeSharePayload(d);

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      {p ? (
        <>
          <p className="text-sm font-semibold text-neutral-500">친구가 공유한 진단 결과예요</p>
          <SharedProfileCard payload={p} />
        </>
      ) : (
        <div className="w-full rounded-2xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
          <p className="font-bold">공유 링크가 잘못됐거나 만료됐어요</p>
          <p className="mt-1 text-sm text-neutral-500">아래 버튼으로 직접 진단해보세요.</p>
        </div>
      )}

      <div className="w-full">
        <Link
          href="/diagnose"
          className="block w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-center text-base font-bold text-white transition active:scale-[0.98] dark:bg-white dark:text-neutral-900"
        >
          나도 진단해보기 (1분)
        </Link>
        <p className="mt-3 text-center text-xs leading-relaxed text-neutral-500">
          ClearGuard — 계약서·문자 속 위험을 근거와 함께 벗겨드립니다.
        </p>
      </div>
    </main>
  );
}
