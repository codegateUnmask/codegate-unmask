import { EmptyState } from '@astryxdesign/core/EmptyState';

/* 스텁 — 커뮤니티 피드는 후속 이슈에서 구현 */
export default function CommunityPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '96px 20px' }}>
      <EmptyState
        title="커뮤니티 준비 중"
        description="사기 수법 제보와 피해 후기를 나누는 공간이 곧 열려요."
      />
    </main>
  );
}
