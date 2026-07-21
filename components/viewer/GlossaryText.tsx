// ============================================================
// [B 담당] GlossaryText — 텍스트 속 글로서리 용어에 점선 밑줄,
// 탭(클릭)하면 쉬운 설명 툴팁. quote·reason 어디든 감싸면 됨.
//   <GlossaryText text={finding.quote} />
// ============================================================

'use client';

import { useMemo, useState } from 'react';
import { findTerms, type GlossaryHit } from '@/lib/glossary.adapter';

interface Seg { text: string; hit?: GlossaryHit }

function segment(text: string, hits: GlossaryHit[]): Seg[] {
  let segs: Seg[] = [{ text }];
  for (const h of hits) {
    const next: Seg[] = [];
    for (const s of segs) {
      if (s.hit || !s.text.includes(h.match)) { next.push(s); continue; }
      const parts = s.text.split(h.match);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p });
        if (i < parts.length - 1) next.push({ text: h.match, hit: h });
      });
    }
    segs = next;
  }
  return segs;
}

export default function GlossaryText({ text }: { text: string }) {
  const segs = useMemo(() => segment(text, findTerms(text)), [text]);
  const [open, setOpen] = useState<number | null>(null);

  if (!segs.some((s) => s.hit)) return <>{text}</>;

  return (
    <>
      {segs.map((s, i) =>
        s.hit ? (
          <span key={i} className="relative inline-block">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(open === i ? null : i); }}
              className="cursor-help border-b-[1.5px] border-dotted border-[var(--ink-soft)] font-medium text-inherit hover:border-[var(--ink)]"
              aria-label={`${s.hit.term} 뜻 보기`}
            >
              {s.text}
            </button>
            {open === i && (
              <span
                role="tooltip"
                className="absolute left-0 top-full z-20 mt-1 block w-max max-w-[270px] rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-left text-[13px] font-normal leading-relaxed text-[var(--ink)] shadow-lg"
              >
                <b className="mb-0.5 block font-bold">{s.hit.term}</b>
                {s.hit.definition}
              </span>
            )}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
