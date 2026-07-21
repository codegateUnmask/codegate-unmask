// ============================================================
// 1단계 빠른 트리아지 — [담당: 코어 오너(A)]
// Claude Haiku로 상위 위험만 빠르게 찾아 SSE로 먼저 흘려보냅니다.
// (2단 분석: 대기시간을 "검사 중"의 증거로 보여주는 로딩 UI와 짝을 이룸)
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import type { DocType, Finding, ScanResult, VulnProfile } from '../types';
import { MODEL, MAX_TOKENS } from '../config';
import { wrapAsData } from './guard';
import { verifyFindings, sortFindingsByRisk } from './citation';
import { buildSystemPrompt } from './prompt';

const client = new Anthropic();

/** TODO(A): 에러 처리 보강. 트리아지가 실패해도 전체 흐름은 full 분석으로 계속 진행되도록 */
export async function runTriage(text: string, docType: DocType, profile?: VulnProfile): Promise<ScanResult> {
  const message = await client.messages.create({
    model: MODEL.triage,
    max_tokens: MAX_TOKENS.triage,
    system: buildSystemPrompt(docType, 'triage', profile),
    messages: [{ role: 'user', content: wrapAsData(text) }],
  });

  const raw = message.content.find((b) => b.type === 'text')?.text ?? '{}';
  const parsed = JSON.parse(raw) as ScanResult;

  const verified: Finding[] = sortFindingsByRisk(verifyFindings(parsed.findings ?? [], text));

  return {
    docType,
    overallLevel: parsed.overallLevel ?? 'warning',
    summary: parsed.summary ?? '분석 중입니다...',
    findings: verified,
    missingDocuments: [],
    unverifiable: [],
    requestPhrases: [],
    officialChannels: [],
    needsExpertReview: [],
    scannedAt: new Date().toISOString(),
  };
}
