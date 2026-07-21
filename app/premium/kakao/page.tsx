// ============================================================
// 카카오페이 결제창에서 돌아오는 랜딩 — pg_token으로 승인 확정  [담당: B]
// ============================================================

'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function KakaoReturnPage() {
  return (
    <Suspense fallback={null}>
      <KakaoReturn />
    </Suspense>
  );
}

function KakaoReturn() {
  const sp = useSearchParams();
  const [state, setState] = useState<'working' | 'ok' | 'cancel' | 'fail'>('working');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode 중복 실행 방지 (승인은 1회만)
    ran.current = true;

    const result = sp.get('result');
    const pgToken = sp.get('pg_token');
    const plan = sp.get('plan') ?? 'premium';

    if (result === 'cancel') { setState('cancel'); return; }
    if (result === 'fail' || !pgToken) { setState('fail'); return; }

    const tid = sessionStorage.getItem('kakao.tid');
    const orderId = sessionStorage.getItem('kakao.orderId');
    if (!tid || !orderId) { setState('fail'); return; }

    fetch('/api/pay/kakao/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tid, pgToken, orderId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) { setState('fail'); return; }
        // 결제 확정 → 구독/패스 상태 저장 (premium 페이지와 같은 키)
        try {
          if (plan === 'premium') {
            localStorage.setItem('unmask.subscription', JSON.stringify({ since: new Date().toISOString() }));
          } else {
            const n = Number(localStorage.getItem('unmask.passes') ?? 0) + 1;
            localStorage.setItem('unmask.passes', String(n));
          }
        } catch { /* 저장 실패해도 승인 자체는 완료 */ }
        sessionStorage.removeItem('kakao.tid');
        sessionStorage.removeItem('kakao.orderId');
        setState('ok');
      })
      .catch(() => setState('fail'));
  }, [sp]);

  const MSG = {
    working: { icon: '…', title: '결제 확인 중', body: '카카오페이 승인을 확인하고 있어요.' },
    ok: { icon: '✓', title: '결제 완료!', body: '카카오페이 테스트 결제가 승인됐어요. 실제 출금은 없습니다.' },
    cancel: { icon: '↩', title: '결제를 취소했어요', body: '언제든 다시 시도할 수 있어요.' },
    fail: { icon: '!', title: '결제에 실패했어요', body: '다시 시도해주세요. 문제가 계속되면 다른 수단을 이용해주세요.' },
  }[state];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
      <span
        className={`grid h-14 w-14 place-items-center rounded-full text-[24px] font-extrabold text-white ${
          state === 'ok' ? 'bg-[var(--safe)]' : state === 'working' ? 'bg-[var(--ink)] animate-pulse' : 'bg-[var(--ink-soft)]'
        }`}
      >
        {MSG.icon}
      </span>
      <h1 className="mt-4 text-[20px] font-extrabold text-[var(--ink)]">{MSG.title}</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-soft)]">{MSG.body}</p>
      <Link
        href="/premium"
        className="mt-6 w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-[15px] font-extrabold text-white"
      >
        {state === 'ok' ? '구독 상태 보러 가기' : '프리미엄으로 돌아가기'}
      </Link>
      {state === 'ok' && (
        <Link href="/scan" className="mt-2 text-[13px] font-bold text-[var(--ink-soft)] underline underline-offset-2">
          바로 판독하러 가기
        </Link>
      )}
    </main>
  );
}
