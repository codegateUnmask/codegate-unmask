// ============================================================
// /premium — 프리미엄·결제 화면 (데모 목업)  [담당: B]
// ⚠️ 실제 결제 아님: PG 연동 없이 결제 UX만 시연하는 데모 모드.
//    실서비스 전환 시 토스페이먼츠 결제위젯으로 교체 예정 지점에 주석 표시.
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type Plan = {
  id: string;
  badge?: string;
  name: string;
  price: string;
  per: string;
  desc: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: 'pass',
    badge: '이사철 인기',
    name: '전세 계약 패스',
    price: '9,900',
    per: '원 / 계약 1건',
    desc: '보증금이 걸린 그 순간, 커피 두 잔 값의 보험',
    features: [
      '계약서 1건 정밀 판독 (조항별 근거·개선안·절충안)',
      '등기부등본 체크리스트 + 특약 요청 문구 세트',
      '전문가 상담 연결 (대한법률구조공단 132 안내)',
    ],
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: '5,900',
    per: '원 / 월',
    desc: '계약과 문자가 일상인 당신의 상시 방패',
    features: [
      '무제한 판독 · 항상 정밀 모델',
      '사진 스캔 무제한 (여러 장 한 번에)',
      '취약 유형 맞춤 훈련 전체 + Shield Score 추적',
      '가족 보호 — 부모님 기기의 문자 판독 공유',
    ],
  },
];

const PAY_METHODS = [
  { id: 'kakao', label: '카카오페이', mark: 'pay' },
  { id: 'toss', label: '토스페이', mark: 'toss' },
  { id: 'card', label: '신용·체크카드', mark: 'card' },
] as const;

type Step = 'closed' | 'sheet' | 'processing' | 'done';

export default function PremiumPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<Step>('closed');
  const [method, setMethod] = useState<string>('kakao');

  function openSheet(p: Plan) {
    setPlan(p);
    setMethod('kakao');
    setStep('sheet');
  }

  function pay() {
    // ── 실서비스 전환 지점 ──────────────────────────────
    // 여기서 토스페이먼츠 결제위젯 호출로 교체:
    //   loadTossPayments(clientKey) → widgets.requestPayment(...)
    // 데모에서는 1.2초 처리 연출 후 완료 화면.
    // ──────────────────────────────────────────────────
    setStep('processing');
    setTimeout(() => setStep('done'), 1200);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-9">
      <header className="mb-8">
        <p className="font-mono text-[13px] font-bold tracking-[0.22em] text-[var(--ink-soft)]">
          UNMASK PREMIUM
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--ink)]">
          위험을 <span className="hl-brand">먼저 아는</span> 사람들의 선택
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--ink-soft)]">
          판독 1회가 막아주는 손해는 보증금 몇천만 원일 수 있어요.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <section
            key={p.id}
            className={`card-in flex flex-col rounded-2xl border bg-white p-5 ${
              p.badge ? 'border-2 border-[var(--ink)]' : 'border-[var(--line)]'
            }`}
          >
            {p.badge && (
              <span className="mb-2 w-fit rounded-md bg-[var(--ink)] px-2.5 py-1 font-mono text-[11.5px] font-bold tracking-wider text-white">
                {p.badge}
              </span>
            )}
            <h2 className="text-[18px] font-extrabold text-[var(--ink)]">{p.name}</h2>
            <p className="mt-0.5 text-[13.5px] text-[var(--ink-soft)]">{p.desc}</p>
            <p className="mt-3">
              <span className="text-[30px] font-extrabold text-[var(--ink)]">{p.price}</span>
              <span className="ml-1 text-[13px] font-bold text-[var(--ink-soft)]">{p.per}</span>
            </p>
            <ul className="mt-3 flex-1 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="text-[13.5px] leading-relaxed text-[var(--ink)]">
                  <b className="text-[var(--safe)]">✓</b> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openSheet(p)}
              className="mt-4 w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-[15px] font-extrabold text-white transition-transform active:scale-[0.98]"
            >
              {p.id === 'pass' ? '이 계약 지키기' : '시작하기'}
            </button>
          </section>
        ))}
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-[var(--ink-soft)]">
        지금은 시연용 데모 모드입니다 — 실제 결제가 이루어지지 않습니다. 원문 미저장
        원칙은 유료 플랜에서도 동일하게 적용됩니다.
      </p>

      {/* ── 결제 바텀시트 (목업) ── */}
      {step !== 'closed' && plan && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => step === 'sheet' && setStep('closed')}
        >
          <div
            className="card-in w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'sheet' && (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[11.5px] font-bold tracking-wider text-[var(--ink-soft)]">
                      결제 · 데모 모드
                    </p>
                    <h3 className="text-[17px] font-extrabold text-[var(--ink)]">{plan.name}</h3>
                  </div>
                  <p className="text-[20px] font-extrabold text-[var(--ink)]">
                    {plan.price}
                    <span className="text-[12px] text-[var(--ink-soft)]">원</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                        method === m.id
                          ? 'border-[var(--ink)] bg-[var(--paper)]'
                          : 'border-[var(--line)] bg-white'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-lg font-mono text-[10px] font-bold ${
                          m.id === 'kakao'
                            ? 'bg-[#ffe812] text-[#3b1e1e]'
                            : m.id === 'toss'
                              ? 'bg-[#0064ff] text-white'
                              : 'bg-[var(--seg)] text-[var(--ink)]'
                        }`}
                      >
                        {m.mark}
                      </span>
                      <span className="flex-1 text-[15px] font-bold text-[var(--ink)]">
                        {m.label}
                      </span>
                      <span
                        className={`h-4.5 w-4.5 rounded-full border-[5px] ${
                          method === m.id ? 'border-[var(--ink)]' : 'border-[var(--line)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={pay}
                  className="mt-4 w-full rounded-xl bg-[var(--ink)] px-5 py-3.5 text-[16px] font-extrabold text-white active:scale-[0.98]"
                >
                  {plan.price}원 결제하기
                </button>
                <p className="mt-2 text-center text-[11.5px] text-[var(--ink-soft)]">
                  데모 모드 — 실제 결제가 발생하지 않습니다
                </p>
              </>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center py-10">
                <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--ink)]" />
                <p className="mt-3 font-mono text-[13.5px] font-bold tracking-wider text-[var(--ink)]">
                  결제 처리 중…
                </p>
              </div>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center py-7 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--safe)] text-[22px] font-extrabold text-white">
                  ✓
                </span>
                <h3 className="mt-3 text-[18px] font-extrabold text-[var(--ink)]">
                  결제 완료 (데모)
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                  {plan.name} 이용이 시작됐어요.
                  <br />
                  이제 숨은 위험을 먼저 보세요.
                </p>
                <Link
                  href="/scan"
                  className="mt-4 w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-[15px] font-extrabold text-white"
                >
                  판독하러 가기
                </Link>
                <button
                  onClick={() => setStep('closed')}
                  className="mt-2 text-[13px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
