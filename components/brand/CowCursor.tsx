'use client';

// 커서를 따라다니는 흑우 — 홈 후킹("여러분은 흑우신가요?")과 세트인 브랜드 장치.
// [담당: 지식·데이터·인프라(D)]
//
// · 마우스가 있는 기기(pointer: fine)에서만 띄웁니다 — 터치 기기는 커서가 없습니다.
// · prefers-reduced-motion 이면 띄우지 않습니다.
// · 상태 업데이트 없이 ref + rAF로만 움직여 렌더 비용이 없습니다.

import { useEffect, useRef } from 'react';
import styles from './CowCursor.module.css';

function CowFace() {
  return (
    <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
      {/* 뿔 */}
      <path d="M14 18c-4-2-6-6-5-10 4 1 7 4 8 8Z" fill="#d9c9a3" />
      <path d="M50 18c4-2 6-6 5-10-4 1-7 4-8 8Z" fill="#d9c9a3" />
      {/* 귀 */}
      <ellipse cx="9" cy="27" rx="7" ry="4.5" fill="#1c1c1c" transform="rotate(-20 9 27)" />
      <ellipse cx="55" cy="27" rx="7" ry="4.5" fill="#1c1c1c" transform="rotate(20 55 27)" />
      {/* 머리 (흑우니까 검은색) */}
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="#262626" />
      {/* 앞머리 털 */}
      <path d="M24 16c2-3 6-5 8-5s6 2 8 5c-3 2-5 3-8 3s-5-1-8-3Z" fill="#111" />
      {/* 눈 */}
      <circle cx="24" cy="31" r="4.2" fill="#fff" />
      <circle cx="40" cy="31" r="4.2" fill="#fff" />
      <circle cx="25" cy="32" r="2" fill="#111" />
      <circle cx="39" cy="32" r="2" fill="#111" />
      {/* 콧등·콧구멍 */}
      <ellipse cx="32" cy="45" rx="13" ry="8.5" fill="#6b5342" />
      <ellipse cx="27" cy="45" rx="2" ry="2.6" fill="#2b2118" />
      <ellipse cx="37" cy="45" rx="2" ry="2.6" fill="#2b2118" />
      {/* 코뚜레 느낌의 미소 */}
      <path d="M29 50c2 1.6 4 1.6 6 0" stroke="#2b2118" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

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
      <CowFace />
    </div>
  );
}
