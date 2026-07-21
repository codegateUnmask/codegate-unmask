// ============================================================
// ShareResultButtons — 진단 결과 카드 공유 버튼 — [담당: 프론트(B) + 진단(C)]
//   ① 이미지로 공유: 카드를 PNG 캡처 → 클립보드 복사
//      (막힌 환경에선 모바일 공유시트 → PNG 다운로드 순 자동 폴백)
//   ② 링크 복사: /diagnose/shared?d=... — 받는 사람이 로그인 없이 같은 카드를 봄
//
// 의존성: html-to-image (팀 공지 완료 후 설치할 것 — CLAUDE.md §3)
// ============================================================

'use client';

import { type RefObject, useCallback, useState } from 'react';
import { toBlob } from 'html-to-image';

interface Props {
  /** 캡처할 결과 카드의 ref */
  targetRef: RefObject<HTMLElement | null>;
  /** 복사할 공유 링크 (profileToShareUrl 결과) */
  shareUrl: string;
  fileName?: string;
  /** 캡처 배경색 — 카드가 투명 배경이라 페이지 배경과 맞춤 */
  backgroundColor?: string;
}

export default function ShareResultButtons({
  targetRef,
  shareUrl,
  fileName = 'clearguard-type.png',
  backgroundColor = '#ffffff',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2500);
  };

  const captureBlob = useCallback(async (): Promise<Blob> => {
    const node = targetRef.current;
    if (!node) throw new Error('no capture target');
    const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true, backgroundColor });
    if (!blob) throw new Error('capture failed');
    return blob;
  }, [targetRef, backgroundColor]);

  /** ① 이미지 공유: 클립보드 → 공유시트 → 다운로드 순 폴백 */
  const copyImage = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Safari 제약: ClipboardItem 에 Promise 를 클릭 직후 동기적으로 넣어야 함
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': captureBlob() })]);
        flash('이미지가 복사됐어요! 채팅방에 붙여넣기 해보세요 📋');
        return;
      }
      throw new Error('clipboard image unsupported');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setBusy(false);
        return;
      }
      try {
        const blob = await captureBlob();
        const file = new File([blob], fileName, { type: 'image/png' });
        // 폴백 1: 모바일 공유시트 (카톡·인스타로 바로 전송)
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
            flash('공유 완료! ✅');
            return;
          } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return;
          }
        }
        // 폴백 2: PNG 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        flash('이미지로 저장했어요 💾');
      } catch {
        flash('이미지 생성에 실패했어요. 다시 시도해주세요');
      }
    } finally {
      setBusy(false);
    }
  }, [busy, captureBlob, fileName]);

  /** ② 링크 복사 */
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash('링크가 복사됐어요! 카톡에 붙여넣어 보세요 🔗');
    } catch {
      // 인앱 브라우저 등 클립보드가 막힌 환경 폴백
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flash('링크가 복사됐어요! 🔗');
      } catch {
        flash('복사에 실패했어요 — 주소를 직접 복사해주세요');
      }
      document.body.removeChild(ta);
    }
  }, [shareUrl]);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={copyImage}
          disabled={busy}
          className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {busy ? '캡처 중…' : '📸 이미지로 공유'}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="flex-1 rounded-xl border border-neutral-300 px-5 py-3 text-sm font-bold text-neutral-700 transition active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300"
        >
          🔗 링크 복사
        </button>
      </div>
      {msg && (
        <p role="status" className="text-xs font-semibold text-neutral-500">
          {msg}
        </p>
      )}
    </div>
  );
}
