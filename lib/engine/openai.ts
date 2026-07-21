import OpenAI from 'openai';
import { MAX_TOKENS } from '../config';

export type AnalysisStage = 'triage' | 'scan';

const ANALYSIS_ERROR_MESSAGE = '문서 분석에 실패했습니다.';
export const OPENAI_REQUEST_TIMEOUT_MS = 30_000;

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
  const client = new OpenAI({ apiKey, maxRetries: 0, timeout: OPENAI_REQUEST_TIMEOUT_MS });
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
