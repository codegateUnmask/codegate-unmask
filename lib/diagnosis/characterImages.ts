// ============================================================
// 유형별 캐릭터 일러스트 경로 매핑
//
// public/characters/ 에 심플하고 귀여운 SVG 일러스트 16종이 이미 들어있습니다
// (제가 간단하게 생성한 임시 버전입니다 — 나중에 더 마음에 드는 일러스트로
//  교체하고 싶으면 같은 파일명으로 덮어쓰기만 하면 됩니다. PNG/WebP로 바꿔도
//  되고, 그때는 아래 경로의 확장자만 바꿔주면 됩니다).
// ============================================================

export const CHARACTER_IMAGE: Record<string, string> = {
  // 취약형
  INFP: '/characters/INFP.png',
  ENFP: '/characters/ENFP.png',
  ESFP: '/characters/ESFP.png',
  ESTP: '/characters/ESTP.png',
  ISFJ: '/characters/ISFJ.png',
  ESFJ: '/characters/ESFJ.png',
  ENFJ: '/characters/ENFJ.png',
  ISFP: '/characters/ISFP.png',

  // 방어형
  ISTJ: '/characters/ISTJ.png',
  ENTJ: '/characters/ENTJ.png',
  ESTJ: '/characters/ESTJ.png',
  ENTP: '/characters/ENTP.png',
  INTJ: '/characters/INTJ.png',
  INFJ: '/characters/INFJ.png',
  INTP: '/characters/INTP.png',
  ISTP: '/characters/ISTP.png',
};
