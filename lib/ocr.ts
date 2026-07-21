// ============================================================
// [B 담당] 사진 → 텍스트 (온디바이스 OCR)
// ⚠️ 팀 원칙(USE_OCR) 준수 방식: 사진은 브라우저를 떠나지 않습니다.
//    Tesseract.js가 브라우저 안(WASM)에서 글자를 추출하고,
//    추출된 '텍스트'만 기존 마스킹→판독 파이프라인을 탑니다.
//    (config의 USE_OCR=false 사유였던 "외부 전송"이 발생하지 않음)
// 사용: config에서 USE_OCR=true 로 켜면 사진 버튼이 나타남 (팀 사인오프 후)
// ============================================================

export async function imagesToText(
  files: File[],
  onProgress?: (msg: string) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js'); // 동적 로드(번들 경량화)
  onProgress?.('문자 인식 모델 준비 중…');
  const worker = await createWorker('kor+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text')
        onProgress?.(`사진에서 글자를 읽는 중… ${Math.round(m.progress * 100)}%`);
    },
  });
  const out: string[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      if (files.length > 1) onProgress?.(`사진 ${i + 1}/${files.length} 읽는 중…`);
      const { data } = await worker.recognize(files[i]);
      out.push(data.text.trim());
    }
  } finally {
    await worker.terminate();
  }
  return out.join('\n\n');
}
