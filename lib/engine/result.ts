import type { Finding, ScanResult } from '../types';

export type ScanCandidate = Omit<ScanResult, 'docType' | 'scannedAt'>;

const ANALYSIS_ERROR_MESSAGE = '문서 분석에 실패했습니다.';
const RISK_LEVELS = new Set(['danger', 'warning', 'safe']);
const STRING_ARRAY_FIELDS = [
  'missingDocuments',
  'unverifiable',
  'requestPhrases',
  'officialChannels',
  'needsExpertReview',
] as const;
const OPTIONAL_FINDING_FIELDS = [
  'clauseTitle',
  'detailedReason',
  'action',
  'legalBasis',
] as const;
const FINDING_FIELDS = new Set([
  'id',
  'level',
  'quote',
  'reason',
  ...OPTIONAL_FINDING_FIELDS,
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRiskLevel(value: unknown): value is Finding['level'] {
  return typeof value === 'string' && RISK_LEVELS.has(value);
}

function isFinding(value: unknown): value is Finding {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isRiskLevel(value.level) &&
    typeof value.quote === 'string' &&
    typeof value.reason === 'string' &&
    Object.keys(value).every((field) => FINDING_FIELDS.has(field)) &&
    OPTIONAL_FINDING_FIELDS.every((field) => typeof value[field] === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function parseScanCandidate(raw: string): ScanCandidate {
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    !isRiskLevel(value.overallLevel) ||
    typeof value.summary !== 'string' ||
    !Array.isArray(value.findings) ||
    !value.findings.every(isFinding) ||
    !STRING_ARRAY_FIELDS.every((field) => isStringArray(value[field])) ||
    typeof value.personalized !== 'string'
  ) {
    throw new Error(ANALYSIS_ERROR_MESSAGE);
  }
  return value as ScanCandidate;
}
