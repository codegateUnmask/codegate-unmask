// ============================================================
// 훈련 화면 — [담당: 프론트(B) + 지식·프롬프트(C)] · Day2 스트레치
// 아직 구현 전. 라우트 자리만 잡아둔 상태입니다.
// ============================================================
import { EmptyState } from '@astryxdesign/core/EmptyState';

export default function TrainPage() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-6">
      <EmptyState
        title="훈련 모드 — 준비 중"
        description="Day2 스트레치 목표입니다. 진단·판독이 먼저 완성되면 이어서 만듭니다."
      />
    </main>
  );
}
