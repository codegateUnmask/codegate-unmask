// ============================================================
// 우측 상단 프로필 버튼 — 계정·구독·내 유형 요약  [담당: B]
// 전역(layout)에 떠 있는 동그란 버튼. 탭하면 카드가 열림.
//  - 계정: 로그인(팀장 구현) 연동 전까지 '게스트 모드' 표기
//  - 구독: /premium이 저장하는 unmask.subscription / unmask.passes 사용
//  - 유형: 진단 스토어(useAppStore)의 profile 사용
// ============================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

interface Subscription { since: string }

function nextBilling(iso: string): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [passes, setPasses] = useState(0);
  // 실레포의 profile 타입(16유형 확장 등)이 어떻게 바뀌어도 안전하게 읽기
  const profile = useAppStore((s) => s.profile) as
    | { typeName?: string; tagline?: string }
    | null;
  const boxRef = useRef<HTMLDivElement>(null);

  // 열 때마다 최신 구독 상태 읽기 (다른 탭/화면에서 바뀌었을 수 있으니)
  useEffect(() => {
    if (!open) return;
    try {
      const s = localStorage.getItem('unmask.subscription');
      setSub(s ? JSON.parse(s) : null);
      setPasses(Number(localStorage.getItem('unmask.passes') ?? 0));
    } catch { /* 저장소 접근 불가 시 무시 */ }
  }, [open]);

  // 바깥 클릭·ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="fixed right-4 top-4 z-40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="내 프로필 열기"
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-full border-2 border-[var(--line)] bg-white text-[19px] shadow-sm transition-transform active:scale-95"
      >
        {profile ? '🧭' : '👤'}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="내 프로필"
          className="card-in absolute right-0 top-[52px] w-[280px] rounded-2xl border border-[var(--line)] bg-white p-4 shadow-xl"
        >
          {/* 계정 */}
          <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--paper)] text-[18px]">
              {profile ? '🧭' : '👤'}
            </span>
            <div>
              <p className="text-[14px] font-extrabold text-[var(--ink)]">게스트 모드</p>
              <p className="text-[11.5px] text-[var(--ink-soft)]">로그인 기능 준비 중</p>
            </div>
          </div>

          {/* 구독 상태 */}
          <div className="border-b border-[var(--line)] py-3">
            <p className="font-mono text-[10.5px] font-bold tracking-wider text-[var(--ink-soft)]">
              구독
            </p>
            {sub ? (
              <p className="mt-1 text-[13.5px] font-bold text-[var(--ink)]">
                <span className="text-[var(--safe)]">✓</span> 프리미엄 구독 중
                <span className="block text-[11.5px] font-normal text-[var(--ink-soft)]">
                  다음 결제일 {nextBilling(sub.since)}
                </span>
              </p>
            ) : passes > 0 ? (
              <p className="mt-1 text-[13.5px] font-bold text-[var(--ink)]">
                🎫 전세 계약 패스 {passes}건 보유
              </p>
            ) : (
              <p className="mt-1 text-[13.5px] text-[var(--ink)]">
                무료 플랜
                <Link href="/premium" className="ml-2 text-[12px] font-bold underline underline-offset-2" onClick={() => setOpen(false)}>
                  프리미엄 보기
                </Link>
              </p>
            )}
          </div>

          {/* 내 유형 */}
          <div className="pt-3">
            <p className="font-mono text-[10.5px] font-bold tracking-wider text-[var(--ink-soft)]">
              내 사기 취약 유형
            </p>
            {profile?.typeName ? (
              <>
                <p className="mt-1 text-[13.5px] font-extrabold text-[var(--ink)]">{profile.typeName}</p>
                {profile.tagline && (
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{profile.tagline}</p>
                )}
                <Link
                  href="/diagnose"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-block text-[12px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
                >
                  다시 진단하기
                </Link>
              </>
            ) : (
              <Link
                href="/diagnose"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-[var(--ink)] px-4 py-2.5 text-center text-[13px] font-extrabold text-white"
              >
                1분 진단하고 내 유형 알아보기
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
