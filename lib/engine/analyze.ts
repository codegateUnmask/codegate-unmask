// ============================================================
// 2단계 정밀 분석 — [담당: 코어 오너(A)]
// Claude Opus로 지식 팩을 주입해 7항목 리포트 형태의 JSON을 받습니다.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import type { DocType, Finding, ScanResult, VulnProfile } from '../types';
import { MODEL, MAX_TOKENS } from '../config';
import { wrapAsData } from './guard';
import { verifyFindings, sortFindingsByRisk } from './citation';
import { buildSystemPrompt } from './prompt';

const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수 사용

/**
 * 정밀 분석 1회 호출. TODO(A): JSON 파싱 실패 시 재시도/에러 처리 보강.
 */
export async function analyzeDocument(
  text: string,
  docType: DocType,
  profile?: VulnProfile,
): Promise<ScanResult> {
  const message = await client.messages.create({
    model: MODEL.scan,
    max_tokens: MAX_TOKENS.scan,
    system: buildSystemPrompt(docType, 'full', profile),
    messages: [{ role: 'user', content: wrapAsData(text) }],
  });

  const raw = message.content.find((b) => b.type === 'text')?.text ?? '{}';
  const parsed = JSON.parse(raw) as ScanResult;

  const verified: Finding[] = sortFindingsByRisk(verifyFindings(parsed.findings ?? [], text));

  return {
    ...parsed,
    docType,
    findings: verified,
    scannedAt: new Date().toISOString(),
  };
}
