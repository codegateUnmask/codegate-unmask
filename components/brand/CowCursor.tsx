'use client';

// 커서를 따라다니는 흑우 — 발표 오프닝("여러분은 흑우신가요?")과 세트인 브랜드 장치.
// [담당: 지식·데이터·인프라(D)] · 캐릭터 원화: 현찬(코덱스 작업)
//
// · 마우스가 있는 기기(pointer: fine)에서만 띄웁니다 — 터치 기기는 커서가 없습니다.
// · prefers-reduced-motion 이면 띄우지 않습니다.
// · 상태 업데이트 없이 ref + rAF로만 움직여 렌더 비용이 없습니다.

import { useEffect, useRef } from 'react';
import styles from './CowCursor.module.css';

export default function CowCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let tx = -100;
    let ty = -100;
    let x = -100;
    let y = -100;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.classList.add(styles.visible);
      }
    };

    const tick = () => {
      // 커서를 그대로 덮지 않고 살짝 뒤에서 따라오게 (pawsitive 발바닥 느낌)
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x + 14}px, ${y + 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cow} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- 고정 오버레이라 next/image 최적화 불필요 */}
      <img src="/cow-cursor.png" alt="" width={44} height={50} draggable={false} />
    </div>
  );
}
