// ============================================================
// 진단 결과 공유 — URL 인코딩/디코딩 — [담당: 프론트(B) + 진단(C)]
//
// DB 없이 링크만으로 결과 카드를 재현합니다.
// VulnProfile의 표시용 필드만 base64url로 압축해 /diagnose/shared?d=... 에 싣습니다.
// 개인정보·원문 없음(비식별 유형 정보뿐) — 팀 CLAUDE.md §8 저장 원칙과 정합.
// 서버(공유 페이지 SSR)와 클라이언트 양쪽에서 동작합니다 (Node 18+ atob/btoa).
// ============================================================

import type { VulnProfile } from '@/lib/types';

/** 링크에 싣는 최소 페이로드 (URL 길이를 줄이려 키를 축약) */
export interface SharePayload {
  /** typeCode (캐릭터 이미지 /{c}.png 로도 사용) */
  c: string;
  /** typeName */
  n: string;
  /** tagline */
  t?: string;
  /** characterTitle */
  ct?: string;
  /** category — 'd'(defensive) | 'v'(vulnerable) */
  g?: 'd' | 'v';
  /** axes — [authority, urgency, greed, verify] */
  a: [number, number, number, number];
  /** weakAgainst (최대 4개) */
  w?: string[];
  /** strengths (최대 3개) */
  s?: string[];
}

function toB64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 진단 결과 → 공유 URL (클라이언트에서 호출) */
export function profileToShareUrl(p: VulnProfile): string {
  const payload: SharePayload = {
    c: p.typeCode,
    n: p.typeName,
    ...(p.tagline ? { t: p.tagline } : {}),
    ...(p.characterTitle ? { ct: p.characterTitle } : {}),
    ...(p.category ? { g: p.category === 'defensive' ? 'd' : 'v' } : {}),
    a: [p.axes.authority, p.axes.urgency, p.axes.greed, p.axes.verify],
    ...(p.weakAgainst?.length ? { w: p.weakAgainst.slice(0, 4) } : {}),
    ...(p.strengths?.length ? { s: p.strengths.slice(0, 3) } : {}),
  };
  const d = toB64Url(JSON.stringify(payload));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/diagnose/shared?d=${d}`;
}

/** 공유 URL의 d 파라미터 → 페이로드 (서버 컴포넌트에서 호출) */
export function decodeSharePayload(d: string | string[] | undefined | null): SharePayload | null {
  if (!d || Array.isArray(d)) return null;
  try {
    const obj = JSON.parse(fromB64Url(d)) as SharePayload;
    if (!obj || typeof obj.c !== 'string' || typeof obj.n !== 'string') return null;
    if (!Array.isArray(obj.a) || obj.a.length !== 4 || obj.a.some((v) => typeof v !== 'number')) {
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}
