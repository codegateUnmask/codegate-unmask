'use client';

// 흑우 러너 진행 게이지 — [담당: 지식·데이터·인프라(D)]
// pawsitive 교육센터의 "달리는 강아지 → 완주 시 왕관" 연출을 흑우로 옮겼습니다.
//
// 0%에서 시작해 실제 진도까지 달려가고, 100%면 왕관을 쓰고 멈춥니다.

import { useEffect, useRef, useState } from 'react';
import styles from './ProgressRunner.module.css';

interface Props {
  /** 0~100 */
  percent: number;
}

export default function ProgressRunner({ percent }: Props) {
  const pct = Math.min(100, Math.max(0, percent));
  const [width, setWidth] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 0에서 목표까지 달려가는 연출 — 거리에 비례해 시간을 줍니다.
    const duration = Math.max(700, Math.min(2200, pct * 18));
    setWidth(0);
    setRunning(false);

    const start = requestAnimationFrame(() => {
      setWidth(pct);
      if (pct > 0) setRunning(true);
    });

    timer.current = setTimeout(() => setRunning(false), duration + 120);

    return () => {
      cancelAnimationFrame(start);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pct]);

  const duration = Math.max(700, Math.min(2200, pct * 18));
  const done = pct >= 100;

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${width}%`, transitionDuration: `${duration}ms` }} />
        <div
          className={`${styles.runner} ${running ? styles.running : ''}`}
          style={{ left: `${width}%`, transitionDuration: `${duration}ms` }}
          aria-hidden="true"
        >
          {done && !running && <span className={styles.crown}>👑</span>}
          {/* eslint-disable-next-line @next/next/no-img-element -- 고정 크기 장식 이미지 */}
          <img src="/cow-cursor.png" alt="" className={styles.cow} />
        </div>
      </div>

      {done && (
        <>
          <p className={styles.escape}>🎉 흑우 탈출 완료!</p>
          <p className={styles.escapeSub}>
            이제 당신은 근거를 확인하고 서명하는 사람입니다.
          </p>
        </>
      )}
    </div>
  );
}
