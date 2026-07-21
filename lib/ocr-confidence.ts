export interface OcrSourceLine {
  text: string;
  score: number;
}

export interface ContractOcrLine {
  text: string;
  confidence: number;
  critical: boolean;
  lowConfidence: boolean;
}

export interface ContractOcrAssessment {
  text: string;
  lines: ContractOcrLine[];
}

const CRITICAL_KEYWORDS =
  /금액|보증금|계약금|중도금|잔금|월세|임대료|위약금|환불|환급|중도\s*해지|계약\s*기간|계약일|시작일|종료일|만료일|자동\s*갱신|주민등록번호|주민번호|연락처|전화번호|휴대전화|계좌번호|계좌|예금주/;
const MONEY = /\d[\d,]*(?:\.\d+)?\s*(?:원|만원|억원)/;
const DATE = /\d{4}\s*(?:[./-]|년)\s*\d{1,2}\s*(?:[./-]|월)\s*\d{1,2}/;
const RESIDENT_NUMBER = /\b\d{6}[- ]?[1-4]\d{6}\b/;
const PHONE =
  /(?:^|\D)(?:01[016789][-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4})(?:\D|$)/;
const ACCOUNT_NUMBER = /\b\d{2,6}(?:[-\s]\d{2,6}){2,5}\b/;

export function parseOcrConfidenceThreshold(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const threshold = Number(value);
  return Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 ? threshold : null;
}

export function isCriticalContractLine(text: string): boolean {
  return (
    CRITICAL_KEYWORDS.test(text) ||
    MONEY.test(text) ||
    DATE.test(text) ||
    RESIDENT_NUMBER.test(text) ||
    PHONE.test(text) ||
    ACCOUNT_NUMBER.test(text)
  );
}

export function assessOcrLines(
  sourceLines: readonly OcrSourceLine[],
  thresholdValue = process.env.NEXT_PUBLIC_OCR_CONFIDENCE_THRESHOLD,
): ContractOcrAssessment {
  const threshold = parseOcrConfidenceThreshold(thresholdValue);
  const lines = sourceLines
    .map(({ text, score }) => {
      const normalizedText = text.trim();
      const validConfidence = Number.isFinite(score) && score >= 0 && score <= 1;
      const confidence = validConfidence ? score : -1;
      return {
        text: normalizedText,
        confidence,
        critical: isCriticalContractLine(normalizedText),
        lowConfidence: !validConfidence || (threshold !== null && confidence < threshold),
      };
    })
    .filter(({ text }) => text.length > 0);

  if (lines.length === 0) throw new Error('이미지에서 계약서 텍스트를 찾지 못했습니다.');

  return {
    text: lines.map(({ text }) => text).join('\n'),
    lines,
  };
}
