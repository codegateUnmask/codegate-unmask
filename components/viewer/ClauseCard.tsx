// ============================================================
// 조항 1개 카드 — [담당: 프론트(B)]
// 신호등 색 + 원문 인용 + 1차 짧은 이유 + "왜요?" 클릭 시 상세 설명.
// ============================================================
'use client';

import { useState } from 'react';
import type { Finding } from '@/lib/types';
import { RISK_LABEL } from '@/lib/config';

const LEVEL_STYLE: Record<Finding['level'], string> = {
  danger: 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
  warning: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
  safe: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
};

const LEVEL_BADGE: Record<Finding['level'], string> = {
  danger: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  safe: 'bg-emerald-600 text-white',
};

export function ClauseCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${LEVEL_STYLE[finding.level]}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_BADGE[finding.level]}`}>
          {RISK_LABEL[finding.level]}
        </span>
        {finding.clauseTitle && <span className="text-sm text-neutral-500">{finding.clauseTitle}</span>}
      </div>

      <blockquote className="mb-2 border-l-2 border-neutral-300 pl-3 text-sm italic text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        “{finding.quote}”
      </blockquote>

      <p className="text-sm">{finding.reason}</p>

      {finding.detailedReason && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {expanded ? '접기' : '왜요?'}
        </button>
      )}
      {expanded && finding.detailedReason && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{finding.detailedReason}</p>
      )}

      {finding.action && (
        <p className="mt-3 text-sm font-medium">👉 {finding.action}</p>
      )}
      {finding.legalBasis && (
        <p className="mt-1 text-xs text-neutral-400">근거: {finding.legalBasis}</p>
      )}
    </div>
  );
}
