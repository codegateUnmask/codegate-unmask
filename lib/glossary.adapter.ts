// ============================================================
// [B 담당] 글로서리 어댑터 — D의 lib/knowledge/glossary.ts를 안전하게 연결.
//
// 왜 어댑터를 두나:
//  - glossary.ts는 PR #8 소속이라 아직 레포에 없을 수 있음 → 없어도 빌드가 안 깨져야 함
//  - findGlossaryTerms()의 반환 형태를 확정 못 함 → 문자열/객체 배열 양쪽 다 수용
//  - D 파일이 들어오면 이 어댑터가 자동으로 실제 데이터를 씀 (컴포넌트 수정 불필요)
//
// D 파일이 오면: 아래 tryLoad()의 동적 import 경로만 맞으면 그대로 동작.
// ============================================================

export interface GlossaryHit {
  term: string;        // 원문에 등장한 용어 (예: '확정일자')
  definition: string;  // 쉬운 설명 (툴팁에 표시)
}

// D의 findGlossaryTerms가 돌려줄 수 있는 형태들을 모두 흡수
type RawHit =
  | string
  | { term?: string; word?: string; name?: string;
      definition?: string; desc?: string; description?: string; meaning?: string };

let cached: ((text: string) => RawHit[]) | null = null;
let tried = false;

async function tryLoad(): Promise<((text: string) => RawHit[]) | null> {
  if (tried) return cached;
  tried = true;
  try {
    // D의 실제 모듈. 없으면 catch로 빠짐(빌드/런타임 안전).
    // 경로를 변수로 두어 빌드 타임 모듈 해석을 피함(파일이 아직 없어도 빌드 통과).
    // D의 glossary.ts가 들어오면 런타임에 정상 로드됨.
    const path = '@/lib/knowledge/glossary';
    const mod: Record<string, unknown> = await import(/* webpackIgnore: true */ path);
    const fn = (mod.findGlossaryTerms ?? mod.default) as ((t: string) => RawHit[]) | undefined;
    cached = typeof fn === 'function' ? fn : null;
  } catch {
    cached = null; // glossary.ts가 아직 없음 → 하이라이트 없이 정상 동작
  }
  return cached;
}

function normalize(raw: RawHit[]): GlossaryHit[] {
  const out: GlossaryHit[] = [];
  for (const r of raw) {
    if (typeof r === 'string') {
      out.push({ term: r, definition: '' });
    } else if (r && typeof r === 'object') {
      const term = r.term ?? r.word ?? r.name ?? '';
      const definition = r.definition ?? r.desc ?? r.description ?? r.meaning ?? '';
      if (term) out.push({ term, definition });
    }
  }
  // 긴 용어 우선(부분 겹침 시 긴 쪽을 먼저 잡아 하이라이트 정확도↑)
  return out.sort((a, b) => b.term.length - a.term.length);
}

/** 텍스트에서 글로서리 용어를 찾아 반환. glossary.ts가 없으면 빈 배열. */
export async function findTerms(text: string): Promise<GlossaryHit[]> {
  if (!text) return [];
  const fn = await tryLoad();
  if (!fn) return [];
  try {
    return normalize(fn(text) ?? []);
  } catch {
    return [];
  }
}
