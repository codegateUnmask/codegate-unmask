import { assessOcrLines, type ContractOcrAssessment, type OcrSourceLine } from './ocr-confidence';
import {
  assessImageQuality,
  measureImageQuality,
  readImageQualityPolicy,
  type ImageQualityReason,
} from './ocr-quality';

type OcrClient = {
  predict(
    image: ImageBitmap,
    params: { textRecScoreThresh: number },
  ): Promise<Array<{ items: OcrSourceLine[] }>>;
};

export type ContractImageExtraction =
  | {
      decision: 'recapture';
      reasons: ImageQualityReason[];
    }
  | {
      decision: 'review-required';
      assessment: ContractOcrAssessment;
    };

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 30_000_000;
const KOREAN_MODEL_URL =
  'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/korean_PP-OCRv5_mobile_rec_onnx_infer.tar';

let ocrPromise: Promise<OcrClient> | undefined;

async function decodeContractImage(file: File): Promise<ImageBitmap> {
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    throw new Error('JPG 또는 PNG 이미지 한 장을 선택해 주세요.');
  }
  if (file.size === 0) throw new Error('비어 있는 이미지 파일은 처리할 수 없습니다.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('20MB 이하 이미지를 선택해 주세요.');

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  } catch {
    throw new Error('이미지 파일을 읽지 못했습니다.');
  }

  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;

  if ((file.type === 'image/png' && !isPng) || (file.type !== 'image/png' && !isJpeg)) {
    throw new Error('파일 형식과 실제 이미지 형식이 일치하지 않습니다.');
  }
  if (typeof createImageBitmap !== 'function') {
    throw new Error('이 브라우저에서는 이미지 OCR을 지원하지 않습니다.');
  }

  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('손상되었거나 지원하지 않는 이미지입니다.');
  }

  if (image.width * image.height > MAX_IMAGE_PIXELS) {
    image.close();
    throw new Error('이미지 해상도가 너무 큽니다.');
  }
  return image;
}

async function createKoreanOcr(modelUrl: string): Promise<OcrClient> {
  const { PaddleOCR } = await import('@paddleocr/paddleocr-js');
  const client = await PaddleOCR.create({
    textDetectionModelName: 'PP-OCRv5_mobile_det',
    textRecognitionModelName: 'korean_PP-OCRv5_mobile_rec',
    textRecognitionModelAsset: { url: modelUrl },
    worker: true,
    ortOptions: {
      backend: 'wasm',
      wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
      numThreads: 1,
      simd: true,
    },
  });

  return {
    predict: (image, params) => client.predict(image, params),
  };
}

async function getKoreanOcr(): Promise<OcrClient> {
  const modelUrl = process.env.NEXT_PUBLIC_OCR_KOREAN_MODEL_URL?.trim() || KOREAN_MODEL_URL;

  if (!ocrPromise) ocrPromise = createKoreanOcr(modelUrl);
  try {
    return await ocrPromise;
  } catch {
    ocrPromise = undefined;
    throw new Error('한국어 OCR 모델을 불러오지 못했습니다.');
  }
}

export async function extractContractText(file: File): Promise<ContractImageExtraction> {
  const image = await decodeContractImage(file);
  try {
    const metrics = measureImageQuality(image);
    const quality = assessImageQuality(metrics, readImageQualityPolicy());

    if (quality.decision === 'recapture') {
      return { decision: 'recapture', reasons: quality.reasons };
    }

    const ocr = await getKoreanOcr();
    let result: { items: OcrSourceLine[] } | undefined;
    try {
      [result] = await ocr.predict(image, { textRecScoreThresh: 0 });
    } catch {
      throw new Error('이미지에서 텍스트를 추출하지 못했습니다.');
    }

    return {
      decision: 'review-required',
      assessment: assessOcrLines(result?.items ?? []),
    };
  } finally {
    image.close();
  }
}
