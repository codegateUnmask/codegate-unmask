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
  INFP: '/characters/INFP.svg',
  ENFP: '/characters/ENFP.svg',
  ESFP: '/characters/ESFP.svg',
  ESTP: '/characters/ESTP.svg',
  ISFJ: '/characters/ISFJ.svg',
  ESFJ: '/characters/ESFJ.svg',
  ENFJ: '/characters/ENFJ.svg',
  ISFP: '/characters/ISFP.svg',
  // 방어형
  ISTJ: '/characters/ISTJ.svg',
  ENTJ: '/characters/ENTJ.svg',
  ESTJ: '/characters/ESTJ.svg',
  ENTP: '/characters/ENTP.svg',
  INTJ: '/characters/INTJ.svg',
  INFJ: '/characters/INFJ.svg',
  INTP: '/characters/INTP.svg',
  ISTP: '/characters/ISTP.svg',
};
