// 진단 결과 카드 이미지 생성 — [담당: 지식·데이터·인프라(D)]
//
// html2canvas 같은 라이브러리를 새로 깔지 않고, Canvas에 직접 그립니다.
// (팀 CLAUDE.md §3 "새 라이브러리를 임의로 설치하지 마세요")
// 캐릭터 PNG는 same-origin(public/)이라 canvas가 오염되지 않아 toBlob이 됩니다.

import type { VulnProfile } from '../types';

const W = 1080;
const H = 1350; // 인스타 세로 비율 4:5

const AXIS_LABELS: { key: keyof VulnProfile['axes']; label: string; safe: boolean }[] = [
  { key: 'authority', label: '권위에 약한 정도', safe: false },
  { key: 'urgency', label: '재촉에 약한 정도', safe: false },
  { key: 'greed', label: '이득 유혹에 약한 정도', safe: false },
  { key: 'verify', label: '검증 습관 (높을수록 안전)', safe: true },
];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 긴 문장을 maxWidth에 맞춰 줄바꿈하고, 마지막 y좌표를 돌려줍니다. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99,
): number {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;
      if (lines >= maxLines) return y;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // 캐릭터가 없어도 카드는 나와야 합니다
    img.src = src;
  });
}

/** 진단 결과를 공유용 카드 이미지(PNG Blob)로 그립니다. */
export async function renderResultCard(profile: VulnProfile): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 배경
  ctx.fillStyle = '#f7f7f2';
  ctx.fillRect(0, 0, W, H);

  // 상단 브랜드 바
  ctx.fillStyle = '#1f2412';
  ctx.fillRect(0, 0, W, 12);

  // 워드마크
  ctx.textBaseline = 'top';
  ctx.font = '700 40px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  ctx.fillStyle = '#1f2412';
  ctx.fillText('Clear', 70, 60);
  const clearW = ctx.measureText('Clear').width;
  ctx.fillStyle = '#a8b312';
  ctx.fillText('Guard', 70 + clearW, 60);

  ctx.font = '500 26px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  ctx.fillStyle = '#8a8a80';
  ctx.fillText('사기 취약 유형 진단', 70, 112);

  // 흰 카드
  const cardY = 175;
  const cardH = H - cardY - 130;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 50, cardY, W - 100, cardH, 36);
  ctx.fill();

  // 캐릭터
  const img = await loadImage(`/${profile.typeCode}.png`);
  let y = cardY + 46;
  if (img) {
    const size = 300;
    const ratio = Math.min(size / img.width, size / img.height);
    const dw = img.width * ratio;
    const dh = img.height * ratio;
    ctx.drawImage(img, (W - dw) / 2, y, dw, dh);
    y += dh + 24;
  }

  // 배지
  const isDefensive = profile.category === 'defensive';
  const badge = isDefensive ? '🛡 방어형' : '⚠ 취약형';
  ctx.font = '700 24px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  const bw = ctx.measureText(badge).width + 44;
  ctx.fillStyle = isDefensive ? '#dcfce7' : '#ffe4e6';
  roundRect(ctx, (W - bw) / 2, y, bw, 48, 24);
  ctx.fill();
  ctx.fillStyle = isDefensive ? '#15803d' : '#be123c';
  ctx.textAlign = 'center';
  ctx.fillText(badge, W / 2, y + 11);
  y += 74;

  // 유형명
  ctx.fillStyle = '#1f2412';
  ctx.font = '800 54px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  ctx.fillText(profile.typeName, W / 2, y);
  y += 72;

  if (profile.characterTitle) {
    ctx.fillStyle = '#8a8a80';
    ctx.font = '600 28px system-ui, -apple-system, "Malgun Gothic", sans-serif';
    ctx.fillText(`— ${profile.characterTitle} —`, W / 2, y);
    y += 48;
  }

  // 태그라인
  ctx.fillStyle = '#484944';
  ctx.font = '400 28px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  y = wrapText(ctx, profile.tagline, W / 2, y, W - 220, 42, 2) + 24;

  // 4축 그래프
  ctx.textAlign = 'left';
  const gx = 110;
  const gw = W - 220;
  for (const axis of AXIS_LABELS) {
    const v = Math.min(100, Math.max(0, profile.axes[axis.key]));
    ctx.font = '500 22px system-ui, -apple-system, "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#74756f';
    ctx.fillText(axis.label, gx, y);
    ctx.textAlign = 'right';
    ctx.font = '700 22px system-ui, monospace';
    ctx.fillStyle = '#1f2412';
    ctx.fillText(String(v), gx + gw, y);
    ctx.textAlign = 'left';
    y += 32;
    ctx.fillStyle = '#eeeeea';
    roundRect(ctx, gx, y, gw, 14, 7);
    ctx.fill();
    ctx.fillStyle = axis.safe ? '#22c55e' : '#fb7185';
    roundRect(ctx, gx, y, Math.max(14, (gw * v) / 100), 14, 7);
    ctx.fill();
    y += 38;
  }

  // 하단 안내
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a8a80';
  ctx.font = '500 24px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  ctx.fillText('내 사기 취약 유형은? 1분이면 알 수 있어요', W / 2, H - 96);
  ctx.fillStyle = '#a8b312';
  ctx.font = '700 26px system-ui, -apple-system, "Malgun Gothic", sans-serif';
  ctx.fillText('unmask-sand.vercel.app', W / 2, H - 60);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
