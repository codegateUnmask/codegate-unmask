import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import { AppProviders } from '@/components/AppProviders';
import './layers.css';
import './globals.css';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
});

export const metadata: Metadata = {
  title: 'unmask — 계약서 위험 분석',
  description: '서명하기 전 계약서의 숨겨진 위험을 근거와 함께 확인하세요.',
  applicationName: 'unmask',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'unmask',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#202124',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light" data-astryx-theme="neutral">
      <body className={`${hanken.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
