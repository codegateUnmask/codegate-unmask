import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'unmask — 사기 면역력 트레이너',
  description: '낯선 계약서·문자에 숨은 위험을 AI가 근거와 함께 벗겨드립니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
