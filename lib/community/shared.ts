// 커뮤니티 공용 타입 + 게시판 메타 + 닉네임 생성기 (클라이언트/서버 어디서든 import 가능)

export type BoardType = 'scam-case' | 'report' | 'free';

export interface PostSummary {
  id: string;
  boardType: BoardType;
  title: string;
  nickname: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isMine: boolean;
}

export interface PostDetail extends PostSummary {
  content: string;
  isLiked: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  content: string;
  nickname: string;
  createdAt: string;
  isMine: boolean;
}

export interface CreatePostRequest {
  boardType: BoardType;
  title: string;
  content: string;
  nickname?: string;
}

export interface CreateCommentRequest {
  content: string;
  nickname?: string;
}

export const BOARD_META: Record<
  BoardType,
  { label: string; description: string; accent: string; accentBg: string }
> = {
  'scam-case': {
    label: '사기 사례 공유',
    description: '내 판독 결과나 겪은 사례를 익명으로 올리고 대응 방법을 나눠요.',
    accent: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  report: {
    label: '신고 · 제보',
    description: '새로 발견한 사기 수법이나 의심스러운 사례를 제보해요.',
    accent: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  free: {
    label: '자유게시판',
    description: '가볍게 잡담하거나 고민을 나누는 공간이에요.',
    accent: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-50 dark:bg-sky-950/40',
  },
};

export const BOARD_ORDER: BoardType[] = ['scam-case', 'report', 'free'];

const ADJECTIVES = ['용감한', '신중한', '재빠른', '조용한', '느긋한', '똑똑한', '엉뚱한', '다정한'];
const ANIMALS = ['너구리', '부엉이', '다람쥐', '고슴도치', '수달', '여우', '고양이', '펭귄'];

export function nicknameFromToken(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) >>> 0;
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length];
  return `${adj} ${animal}${h % 1000}`;
}
