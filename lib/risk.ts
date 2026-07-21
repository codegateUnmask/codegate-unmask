// [B 담당] 위험도(%) + 원문 형광펜 분해. 위험도 산식은 임시(프론트 추정치).
import type { Finding, RiskLevel } from './types';

export function riskPercent(overall: RiskLevel | null, findings: Finding[]): number {
  if (!overall) return 0;
  const base = { danger: 74, warning: 42, safe: 12 }[overall];
  const d = findings.filter((f) => f.level === 'danger').length;
  const w = findings.filter((f) => f.level === 'warning').length;
  return Math.min(96, base + Math.max(0, d - (overall === 'danger' ? 1 : 0)) * 8 + w * 5);
}

export interface DocSegment { text: string; level: RiskLevel | null; }

export function segmentDoc(text: string, findings: Finding[]): DocSegment[] {
  let segments: DocSegment[] = [{ text, level: null }];
  const sorted = [...findings].sort((a, b) => b.quote.length - a.quote.length);
  for (const f of sorted) {
    const next: DocSegment[] = [];
    for (const seg of segments) {
      if (seg.level !== null || !seg.text.includes(f.quote)) { next.push(seg); continue; }
      const parts = seg.text.split(f.quote);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p, level: null });
        if (i < parts.length - 1) next.push({ text: f.quote, level: f.level });
      });
    }
    segments = next;
  }
  return segments;
}
