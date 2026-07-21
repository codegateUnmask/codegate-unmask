// 세션 → 진단 결과 소유자 식별키. [담당: 지식·데이터·인프라(D)]
// 서버에 저장하는 값이 아니라, 이 기기 localStorage 안에서
// "이 진단 결과가 어느 로그인의 것인지" 구분하는 용도뿐입니다.

import type { Session } from 'next-auth';

export const ANON_OWNER = 'anon';

/** 로그인돼 있으면 계정 식별키, 아니면 null */
export function identityKey(session: Session | null): string | null {
  const user = session?.user;
  if (!user) return null;
  if (user.email) return `email:${user.email}`;
  // 카카오는 이메일 미제공 가능 / 게스트는 이메일이 없음 → 이름 기반
  if (user.name) return user.isGuest ? `guest:${user.name}` : `social:${user.name}`;
  return 'unknown';
}

/** 진단 직후 로그인하면 결과를 이어받게 하는 세션 플래그 (탭 닫으면 소멸) */
export const FRESH_DIAGNOSIS_KEY = 'cg-fresh-diagnosis';
