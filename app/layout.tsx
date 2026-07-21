import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import TabBar from '@/components/nav/TabBar';
import ProfileMenu from '@/components/ProfileMenu';

export const metadata: Metadata = {
  title: 'ClearGuard — AI 신뢰 검증 서비스',
  description: '계약서·문자·AI 출력의 위험을 AI가 근거와 함께 판독하는 신뢰 검증 서비스입니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body className="antialiased">
        <Providers>
          {children}
          <TabBar />
          <ProfileMenu />
        </Providers>
      </body>
    </html>
  );
}
