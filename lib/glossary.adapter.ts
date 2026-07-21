// ============================================================
// [B 담당] 글로서리 어댑터 — D의 lib/knowledge/glossary.ts 정식 연결.
//
// D의 GlossaryEntry: { term, aliases?, easy, domain? }
//  - easy   → 툴팁에 보여줄 쉬운 설명
//  - aliases → 본문에 다른 표기로 등장할 수 있음 (예: '근저당권' ↔ '근저당')
//    → 본문에 실제로 등장한 표기(match) 기준으로 밑줄을 긋고,
//      툴팁 제목은 대표 용어(term)로 보여준다.
//
// ⚠️ 머지 순서: 이 코드는 D의 knowledge-packs PR(glossary.ts 포함)이
//    main에 머지된 뒤에 머지되어야 빌드가 통과합니다.
// ============================================================

import { findGlossaryTerms } from '@/lib/knowledge/glossary';

export interface GlossaryHit {
  /** 대표 용어 (툴팁 제목) */
  term: string;
  /** 본문에 실제로 등장한 표기 (밑줄 그을 문자열) */
  match: string;
  /** 쉬운 설명 (D의 easy) */
  definition: string;
}

/** 텍스트에 등장하는 글로서리 용어 목록. 동기 함수(LLM 호출 없음). */
export function findTerms(text: string): GlossaryHit[] {
  if (!text) return [];
  try {
    const entries = findGlossaryTerms(text) ?? [];
    const hits: GlossaryHit[] = [];
    for (const e of entries) {
      const keys = [e.term, ...(e.aliases ?? [])].filter((k) => k && text.includes(k));
      for (const k of keys) hits.push({ term: e.term, match: k, definition: e.easy });
    }
    // 긴 표기 우선 → '근저당권'이 '근저당'보다 먼저 잡혀 부분 겹침 방지
    return hits.sort((a, b) => b.match.length - a.match.length);
  } catch {
    return [];
  }
}
