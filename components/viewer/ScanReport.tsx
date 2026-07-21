// ============================================================
// 판독 리포트 전체 — [담당: 프론트(B)]
// summary + findings(신호등) + 7항목 리포트 섹션.
// ============================================================

import type { ScanResult } from '@/lib/types';
import { ClauseCard } from './ClauseCard';

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-neutral-500">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ScanReport({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="font-medium">{result.summary}</p>
        {result.personalized && (
          <p className="mt-2 text-sm text-neutral-500">{result.personalized}</p>
        )}
      </div>

      <section className="space-y-3">
        {result.findings.map((f) => (
          <ClauseCard key={f.id} finding={f} />
        ))}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListSection title="빠진 서류" items={result.missingDocuments} />
        <ListSection title="확인 불가능한 항목" items={result.unverifiable} />
        <ListSection title="계약 전에 요청할 문구" items={result.requestPhrases} />
        <ListSection title="공식 확인 경로" items={result.officialChannels} />
        <ListSection title="전문가 검토가 필요한 부분" items={result.needsExpertReview} />
      </div>
    </div>
  );
}
