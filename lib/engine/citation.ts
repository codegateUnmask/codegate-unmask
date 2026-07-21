import type { Finding } from '../types';
import { MAX_FINDINGS } from '../config';

export function verifyFindings(findings: Finding[], sourceText: string): Finding[] {
  return findings.filter(
    (finding) => finding.quote.trim().length > 0 && sourceText.includes(finding.quote),
  );
}

export function sortFindingsByRisk(findings: Finding[]): Finding[] {
  const order = { danger: 0, warning: 1, safe: 2 } as const;
  return [...findings]
    .sort((a, b) => order[a.level] - order[b.level])
    .slice(0, MAX_FINDINGS);
}
