// next-auth 기본 타입에 우리가 쓰는 필드를 더합니다.
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      /** 닉네임만 입력하고 들어온 체험 사용자인지 */
      isGuest?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    isGuest?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isGuest?: boolean;
  }
}
