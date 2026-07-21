import { MASK_PATTERNS, MASK_REPLACEMENT } from '../config';

const MASK_ORDER = ['phone', 'rrn', 'account', 'email'] as const;

export function maskPII(text: string): string {
  let masked = text;
  for (const key of MASK_ORDER) {
    masked = masked.replace(MASK_PATTERNS[key], MASK_REPLACEMENT[key]);
  }
  return masked;
}
