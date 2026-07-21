import OpenAI from 'openai';
import { MAX_TOKENS } from '../config';

export type AnalysisStage = 'triage' | 'scan';

const ANALYSIS_ERROR_MESSAGE = '문서 분석에 실패했습니다.';

// 단계별 요청 타임아웃.
//
// 기존에는 두 단계 모두 30초 단일값이었는데, 정밀 분석 실측이 10.9~29.4초라
// 여유가 0.6초까지 좁아지는 경우가 있었습니다. 실제로 프로덕션에서
// "triage는 도착했는데 정밀 분석만 실패"가 재현됐고, 총 소요 37.6초가
// triage 실측(5.9~7.8초) + 정확히 30초와 일치해 이 타임아웃이 원인으로 확인됐습니다.
//
// 예산: 라우트 maxDuration(120초) 안에서 최악 15 + 40 = 55초.
// triage는 실측 5.9~7.8초라 15초면 충분하고, 실패해도 정밀 분석으로 넘어갑니다.
export const OPENAI_TIMEOUT_MS = {
  triage: 15_000,
  scan: 40_000,
} as const;

/** @deprecated 단계별 값(OPENAI_TIMEOUT_MS)을 쓰세요. 기존 참조 호환용. */
export const OPENAI_REQUEST_TIMEOUT_MS = OPENAI_TIMEOUT_MS.scan;

export const SCAN_RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    overallLevel: { type: 'string', enum: ['danger', 'warning', 'safe'] },
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          level: { type: 'string', enum: ['danger', 'warning', 'safe'] },
          clauseTitle: { type: 'string' },
          quote: { type: 'string' },
          reason: { type: 'string' },
          detailedReason: { type: 'string' },
          action: { type: 'string' },
          legalBasis: { type: 'string' },
        },
        required: [
          'id',
          'level',
          'clauseTitle',
          'quote',
          'reason',
          'detailedReason',
          'action',
          'legalBasis',
        ],
      },
    },
    missingDocuments: { type: 'array', items: { type: 'string' } },
    unverifiable: { type: 'array', items: { type: 'string' } },
    requestPhrases: { type: 'array', items: { type: 'string' } },
    officialChannels: { type: 'array', items: { type: 'string' } },
    needsExpertReview: { type: 'array', items: { type: 'string' } },
    personalized: { type: 'string' },
  },
  required: [
    'overallLevel',
    'summary',
    'findings',
    'missingDocuments',
    'unverifiable',
    'requestPhrases',
    'officialChannels',
    'needsExpertReview',
    'personalized',
  ],
} as const;

function getStageConfig(stage: AnalysisStage) {
  if (stage === 'triage') {
    return {
      model: process.env.OPENAI_TRIAGE_MODEL?.trim() || 'gpt-5.4-nano',
      reasoningEffort: 'low' as const,
      maxOutputTokens: MAX_TOKENS.triage,
    };
  }

  return {
    model: process.env.OPENAI_SCAN_MODEL?.trim() || 'gpt-5.4-mini',
    reasoningEffort: 'medium' as const,
    maxOutputTokens: MAX_TOKENS.scan,
  };
}

export async function requestStructuredAnalysis(
  stage: AnalysisStage,
  instructions: string,
  input: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error(ANALYSIS_ERROR_MESSAGE);

  const config = getStageConfig(stage);
  const client = new OpenAI({ apiKey, maxRetries: 0, timeout: OPENAI_TIMEOUT_MS[stage] });
  const response = await client.responses.create({
    model: config.model,
    instructions,
    input,
    reasoning: { effort: config.reasoningEffort },
    max_output_tokens: config.maxOutputTokens,
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: 'scan_result',
        strict: true,
        schema: SCAN_RESULT_SCHEMA,
      },
    },
  });

  const output = response.output_text?.trim();
  if (response.status !== 'completed' || !output) throw new Error(ANALYSIS_ERROR_MESSAGE);
  return output;
}
