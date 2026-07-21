import type { DocType, ScanResult, VulnProfile } from '../types';
import { MAX_INPUT_CHARS } from '../config';
import { wrapAsData } from './guard';
import { sortFindingsByRisk, verifyFindings } from './citation';
import { requestStructuredAnalysis } from './openai';
import { buildSystemPrompt } from './prompt';
import { parseScanCandidate } from './result';

const ANALYSIS_ERROR_MESSAGE = '문서 분석에 실패했습니다.';

export async function runTriage(
  text: string,
  docType: DocType,
  profile?: VulnProfile,
): Promise<ScanResult> {
  try {
    const sourceText = text.slice(0, MAX_INPUT_CHARS);
    const raw = await requestStructuredAnalysis(
      'triage',
      buildSystemPrompt(docType, 'triage', profile),
      wrapAsData(sourceText),
    );
    const parsed = parseScanCandidate(raw);
    const findings = sortFindingsByRisk(verifyFindings(parsed.findings, sourceText));

    return {
      docType,
      overallLevel: parsed.overallLevel,
      summary: parsed.summary,
      findings,
      missingDocuments: [],
      unverifiable: [],
      requestPhrases: [],
      officialChannels: [],
      needsExpertReview: [],
      ...(parsed.personalized ? { personalized: parsed.personalized } : {}),
      scannedAt: new Date().toISOString(),
    };
  } catch {
    throw new Error(ANALYSIS_ERROR_MESSAGE);
  }
}
