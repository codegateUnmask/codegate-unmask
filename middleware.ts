// ============================================================
// 접근 제어 — [담당: 지식·데이터·인프라(D)]
//
// 로그인 필요:  /scan, /api/scan   (판독 1건마다 실제 AI 비용이 발생)
// 로그인 불필요: /, /diagnose, /api/diagnose  (진단은 유입 경로 — 막지 않음)
//
// ⚠️ 화면(/scan)만 막고 API(/api/scan)를 열어두면 의미가 없습니다.
//    화면을 우회해 API를 직접 호출하면 그만이므로 둘 다 막습니다.
// ============================================================

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const PROTECTED_PAGES = ['/scan'];
const PROTECTED_APIS = ['/api/scan'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const signedIn = Boolean(req.auth);
  if (signedIn) return NextResponse.next();

  if (PROTECTED_APIS.some((p) => pathname.startsWith(p))) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const loginUrl = new URL('/login', req.nextUrl);
    // 로그인 후 원래 가려던 곳으로 돌려보냅니다(내부 경로만).
    loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // 정적 파일과 인증 라우트 자체는 통과시킵니다.
  matcher: ['/scan/:path*', '/api/scan/:path*'],
};
