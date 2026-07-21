// ============================================================
// 인증 설정 — [담당: 지식·데이터·인프라(D)]
//
// 정책
//   · 취약 유형 진단(/diagnose)은 로그인 없이 누구나 — 유입 경로이므로 막지 않습니다.
//   · 계약서 판독(/scan)은 로그인 필요 — 판독 1건이 실제 API 비용을 쓰기 때문입니다.
//   · 발표·체험용으로 "닉네임만 입력하고 입장"을 별도 제공합니다.
//
// 세션은 DB 없이 JWT로만 유지합니다(해커톤 범위). 저장하는 개인정보는
// 이름·이메일·프로필 이미지 정도이고, 판독 원문은 어떤 경우에도 저장하지 않습니다.
// ============================================================

import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import type { Provider } from 'next-auth/providers';

/** 닉네임 입력값 정리 — 표시용이라 길이·공백만 다듬습니다. */
export function normalizeNickname(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 20) return null;
  return name;
}

/**
 * 환경변수가 실제로 있는 프로바이더만 켭니다.
 * 키가 없는 채로 버튼만 띄우면 눌렀을 때 에러 화면으로 떨어지는데,
 * 데모 중에 그런 일이 생기면 안 되므로 "설정된 것만 보여준다"로 갑니다.
 */
function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET) {
    providers.push(Kakao);
  }
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google);
  }
  if (process.env.AUTH_NAVER_ID && process.env.AUTH_NAVER_SECRET) {
    providers.push(Naver);
  }

  // 체험 입장 — 닉네임만 받습니다.
  // ⚠️ 이것은 신원 확인이 아니라 '체험 모드'입니다. 비밀번호도 계정도 없습니다.
  //    그래서 세션에 isGuest 표시를 남겨, 개인 데이터를 다루는 기능이 생기면
  //    게스트를 구분해 막을 수 있게 해둡니다.
  providers.push(
    Credentials({
      id: 'guest',
      name: '닉네임으로 체험하기',
      credentials: {
        nickname: { label: '닉네임', type: 'text' },
      },
      authorize(credentials) {
        const name = normalizeNickname(credentials?.nickname);
        if (!name) return null;
        return {
          id: `guest:${name}`,
          name,
          email: null,
          image: null,
          isGuest: true,
        };
      },
    }),
  );

  return providers;
}

export const authConfig = {
  providers: buildProviders(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      // 최초 로그인 때만 user가 들어옵니다.
      if (user) token.isGuest = 'isGuest' in user && user.isGuest === true;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.isGuest = token.isGuest === true;
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** 화면에서 "어떤 소셜 버튼을 보여줄지" 판단할 때 씁니다. */
export const enabledSocialProviders = {
  kakao: Boolean(process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET),
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  naver: Boolean(process.env.AUTH_NAVER_ID && process.env.AUTH_NAVER_SECRET),
} as const;
