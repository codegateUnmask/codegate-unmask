export interface ImageQualityMetrics {
  shortSide: number;
  blurScore: number;
}

export interface ImageQualityPolicy {
  minShortSide: number;
  minBlurScore: number;
}

export type ImageQualityReason = 'too-small' | 'blurry';

export type ImageQualityAssessment =
  | { decision: 'review-required' }
  | { decision: 'recapture'; reasons: ImageQualityReason[] }
  | { decision: 'pass' };

const DEFAULT_MIN_SHORT_SIDE = 720;
const DEFAULT_MIN_BLUR_SCORE = 0.0005;

function parsePositiveNumber(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readImageQualityPolicy(
  minShortSideValue = process.env.NEXT_PUBLIC_OCR_MIN_SHORT_SIDE,
  minBlurScoreValue = process.env.NEXT_PUBLIC_OCR_MIN_BLUR_SCORE,
): ImageQualityPolicy | null {
  const minShortSide = minShortSideValue?.trim()
    ? parsePositiveNumber(minShortSideValue)
    : DEFAULT_MIN_SHORT_SIDE;
  const minBlurScore = minBlurScoreValue?.trim()
    ? parsePositiveNumber(minBlurScoreValue)
    : DEFAULT_MIN_BLUR_SCORE;
  if (minShortSide === null || minBlurScore === null) return null;
  return { minShortSide, minBlurScore };
}

export function assessImageQuality(
  metrics: ImageQualityMetrics,
  policy: ImageQualityPolicy | null,
): ImageQualityAssessment {
  if (!policy) return { decision: 'review-required' };

  const reasons: ImageQualityReason[] = [];
  if (metrics.shortSide < policy.minShortSide) reasons.push('too-small');
  if (metrics.blurScore < policy.minBlurScore) reasons.push('blurry');

  return reasons.length > 0
    ? { decision: 'recapture', reasons }
    : { decision: 'pass' };
}

export function measureImageQuality(image: ImageBitmap): ImageQualityMetrics {
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('이미지 품질을 확인하지 못했습니다.');

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const luminance = new Float32Array(width * height);

  for (let index = 0; index < luminance.length; index += 1) {
    const offset = index * 4;
    luminance[index] =
      pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
  }

  let sum = 0;
  let squaredSum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const laplacian =
        luminance[index] * 4 -
        luminance[index - 1] -
        luminance[index + 1] -
        luminance[index - width] -
        luminance[index + width];
      sum += laplacian;
      squaredSum += laplacian * laplacian;
      count += 1;
    }
  }

  const mean = count > 0 ? sum / count : 0;
  const variance = count > 0 ? squaredSum / count - mean * mean : 0;

  return {
    shortSide: Math.min(image.width, image.height),
    blurScore: Math.max(0, variance) / (255 * 255),
  };
}
