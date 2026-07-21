// ============================================================
// [B 담당] GlossaryText — 텍스트 안의 글로서리 용어에 밑줄 + 탭/호버 시 쉬운 설명.
// quote·reason 어디든 감싸 쓰면 됨: <GlossaryText text={finding.quote} />
// glossary.ts가 없으면 그냥 평범한 텍스트로 렌더(안전).
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { findTerms, type GlossaryHit } from '@/lib/glossary.adapter';

interface Seg { text: string; hit?: GlossaryHit }

function segment(text: string, hits: GlossaryHit[]): Seg[] {
  let segs: Seg[] = [{ text }];
  for (const h of hits) {
    if (!h.term) continue;
    const next: Seg[] = [];
    for (const s of segs) {
      if (s.hit || !s.text.includes(h.term)) { next.push(s); continue; }
      const parts = s.text.split(h.term);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p });
        if (i < parts.length - 1) next.push({ text: h.term, hit: h });
      });
    }
    segs = next;
  }
  return segs;
}

export default function GlossaryText({ text }: { text: string }) {
  const [hits, setHits] = useState<GlossaryHit[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    findTerms(text).then((h) => { if (alive) setHits(h); });
    return () => { alive = false; };
  }, [text]);

  if (hits.length === 0) return <>{text}</>;

  return (
    <>
      {segment(text, hits).map((s, i) =>
        s.hit ? (
          <span key={i} className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="cursor-help border-b-[1.5px] border-dotted border-[var(--ink-soft)] font-medium text-[var(--ink)] hover:border-[var(--ink)]"
              aria-label={`${s.hit.term} 뜻 보기`}
            >
              {s.text}
            </button>
            {s.hit.definition && open === i && (
              <span
                role="tooltip"
                className="absolute left-0 top-full z-20 mt-1 block w-max max-w-[260px] rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-normal leading-relaxed text-[var(--ink)] shadow-lg"
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
