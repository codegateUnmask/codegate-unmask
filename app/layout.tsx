import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import TabBar from '@/components/nav/TabBar';
import CowCursor from '@/components/brand/CowCursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://unmask-sand.vercel.app'),
  title: 'ClearGuard — AI 신뢰 검증 서비스',
  description:
    '계약서·문자에 숨은 위험을 AI가 근거와 함께 판독하고, 내 사기 취약 유형을 진단해 훈련시키는 신뢰 검증 서비스입니다.',
  // 진단 결과 공유(카톡·SNS)로 유입될 때 미리보기 카드가 제대로 보이게
  openGraph: {
    // "흑우" 후킹은 발표 멘트로만 쓰기로 해서(현찬), 공유 카드는 중립 문구
    title: 'ClearGuard — 계약서·문자 속 위험, 서명 전에 확인하세요',
    description: '계약서·문자의 숨은 위험을 근거와 함께 벗겨드립니다. 내 사기 취약 유형도 1분 만에.',
    siteName: 'ClearGuard',
    images: [{ url: '/clearguard-logo-final.png', width: 1200, height: 1200 }],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body className="antialiased">
        <Providers>
          {children}
          <TabBar />
          {/* 커서 따라다니는 흑우 — 홈 후킹 문구와 세트 (마우스 기기에서만) */}
          <CowCursor />
        </Providers>
      </body>
    </html>
  );
}
