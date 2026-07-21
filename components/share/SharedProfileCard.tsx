// ============================================================
// SharedProfileCard — 공유 링크 수신자용 결과 카드 — [담당: 프론트(B) + 진단(C)]
// URL 페이로드(SharePayload)만으로 렌더 — /diagnose 결과 카드와 같은 룩.
// 로그인·store 없이 동작해야 하므로 진단 페이지와 분리된 서버 컴포넌트용.
// ============================================================

import type { SharePayload } from '@/lib/share';

const AXIS_LABELS: { idx: 0 | 1 | 2 | 3; label: string; safe: boolean }[] = [
  { idx: 0, label: '권위에 약한 정도', safe: false },
  { idx: 1, label: '재촉에 약한 정도', safe: false },
  { idx: 2, label: '이득 유혹에 약한 정도', safe: false },
  { idx: 3, label: '검증 습관 (높을수록 안전)', safe: true },
];

export default function SharedProfileCard({ payload }: { payload: SharePayload }) {
  const isDefensive = payload.g === 'd';

  return (
    <div className="w-full rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      {/* 분류 배지 */}
      {payload.g && (
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
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- 16종 캐릭터마다 원본 크기가 달라 next/image 고정 크기 요건과 안 맞음 (진단 페이지와 동일) */}
      <img
        src={`/${payload.c}.png`}
        alt={`${payload.ct ?? payload.n} 캐릭터`}
        className="mx-auto mt-4 h-40 w-40 object-contain"
      />

      <p className="mt-4 text-center text-sm text-neutral-500">친구의 사기 취약 유형은</p>
      <h2 className="my-1 text-center text-2xl font-bold">{payload.n}</h2>
      {payload.ct && (
        <p className="text-center text-sm font-semibold text-neutral-500">— {payload.ct} —</p>
      )}
      {payload.t && (
        <p className="mt-2 text-center text-neutral-600 dark:text-neutral-400">{payload.t}</p>
      )}

      {/* 4축 그래프 — 진단 결과 카드와 동일한 시각 언어 */}
      <div className="mt-6 space-y-2.5">
        {AXIS_LABELS.map(({ idx, label, safe }) => {
          const v = Math.min(100, Math.max(0, payload.a[idx] ?? 0));
          return (
            <div key={label}>
              <div className="mb-0.5 flex justify-between text-xs text-neutral-500">
                <span>{label}</span>
                <span className="font-mono font-bold">{v}</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-2 rounded-full ${safe ? 'bg-emerald-500' : 'bg-rose-400'}`}
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {(payload.w?.length ?? 0) > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            이런 수법에 특히 조심해야 해요
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            {payload.w!.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        </div>
      )}

      {(payload.s?.length ?? 0) > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            이런 방어에 강해요
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            {payload.s!.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
