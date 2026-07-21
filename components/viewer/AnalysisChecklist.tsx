// ============================================================
// 로딩 UI = 과업 체크리스트 실시간 채움 — [담당: 프론트(B)]
// 대기 시간을 "검사 중"의 증거로 보여줍니다.
// ⚠️ 실제 완료 순서만 반영할 것 — 가짜로 랜덤 틱을 주지 않습니다.
//    (triage 도착 → 절반 체크 / full 도착 → 전체 체크. 그 이상 세분화하지 않음)
// ============================================================

type Stage = 'idle' | 'triage' | 'full';

export function AnalysisChecklist({ tasks, stage }: { tasks: string[]; stage: Stage }) {
  const checkedCount =
    stage === 'idle' ? 0 : stage === 'triage' ? Math.ceil(tasks.length / 2) : tasks.length;

  return (
    <ul className="space-y-2">
      {tasks.map((task, i) => {
        const done = i < checkedCount;
        return (
          <li key={task} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                done
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-neutral-300 text-transparent dark:border-neutral-700'
              }`}
            >
              ✓
            </span>
            <span className={done ? '' : 'text-neutral-400'}>{task}</span>
          </li>
        );
      })}
    </ul>
  );
}
