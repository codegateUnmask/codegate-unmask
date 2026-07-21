import { EmptyState } from '@astryxdesign/core/EmptyState';

/* 스텁 — 마이페이지는 후속 이슈에서 구현 */
export default function MePage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '96px 20px' }}>
      <EmptyState
        title="마이페이지 준비 중"
        description="진단 결과와 분석 기록을 한곳에서 보게 될 거예요."
      />
    </main>
  );
}
