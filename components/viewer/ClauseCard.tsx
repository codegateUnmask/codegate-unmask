// [B 담당] 조항 1개 카드 — 신호등 색 + 형광펜 인용 + 해설(+자세히) + 개선안 + 근거
'use client';

import { useState } from 'react';
import { RISK_LABEL } from '@/lib/config';
import type { Finding } from '@/lib/types';
import GlossaryText from './GlossaryText';
import type { ScanFinding } from '@/lib/mock.scan';

const STYLE: Record<Finding['level'], { border: string; chip: string; mark: string }> = {
  danger:  { border: 'border-l-[var(--danger)]',  chip: 'bg-[var(--danger)]',  mark: 'bg-[var(--danger-hl)]' },
  warning: { border: 'border-l-[var(--warning)]', chip: 'bg-[var(--warning)]', mark: 'bg-[var(--warning-hl)]' },
  safe:    { border: 'border-l-[var(--safe)]',    chip: 'bg-[var(--safe)]',    mark: 'bg-[var(--safe-hl)]' },
};

export default function ClauseCard({ finding }: { finding: Finding }) {
  const s = STYLE[finding.level];
  const compromise = (finding as ScanFinding).compromise;
  const label = RISK_LABEL[finding.level];
  const [open, setOpen] = useState(false);

  return (
    <article className={`card-in rounded-2xl border border-[var(--line)] border-l-4 ${s.border} bg-white p-5 shadow-[0_1px_4px_rgba(22,32,44,0.06)]`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`rounded-md px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider text-white ${s.chip}`}>
          {label}
        </span>
        {finding.clauseTitle && (
          <h3 className="text-[17px] font-extrabold text-[var(--ink)]">{finding.clauseTitle}</h3>
        )}
      </div>

      <blockquote className="mb-3 text-[17px] leading-[1.9] text-[var(--ink)]">
        <span className={`hl-sweep box-decoration-clone rounded-sm px-1 py-0.5 ${s.mark}`}>
          “<GlossaryText text={finding.quote} />”
        </span>
      </blockquote>

      <p className="mb-2 text-[15.5px] leading-relaxed text-[var(--ink)]">
        <strong className="font-bold">왜 {label} 판정인가요? </strong>
        <GlossaryText text={finding.reason} />
      </p>

      {finding.detailedReason && (
        <div className="mb-2">
          {open && (
            <p className="mb-2 rounded-xl bg-[var(--paper)] px-3.5 py-3 text-[14.5px] leading-relaxed text-[var(--ink)]">
              {finding.detailedReason}
            </p>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-[12.5px] font-bold text-[var(--ink-soft)] underline underline-offset-2"
          >
            {open ? '접기' : '자세히'}
          </button>
        </div>
      )}

      {finding.action && (
        <p className="mb-2 flex gap-2.5 rounded-xl bg-[var(--paper)] px-3.5 py-3 text-[15px] leading-relaxed text-[var(--ink)]">
          <span className="shrink-0 pt-0.5 font-mono text-[12px] font-bold tracking-wider text-[var(--ink-soft)]">
            개선안
          </span>
          <span>{finding.action}</span>
        </p>
      )}

      {compromise && (
        <p className="mb-2 flex gap-2.5 rounded-xl border-[1.5px] border-dashed border-[var(--line)] px-3.5 py-3 text-[15px] leading-relaxed text-[var(--ink)]">
          <span className="shrink-0 pt-0.5 font-mono text-[12px] font-bold tracking-wider text-[var(--ink-soft)]">
            절충안
          </span>
          <span>{compromise}</span>
        </p>
      )}

      {finding.legalBasis && (
        <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">근거 · {finding.legalBasis}</p>
      )}
    </article>
  );
}
