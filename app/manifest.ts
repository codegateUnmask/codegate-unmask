import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClearGuard — AI 신뢰 검증 서비스',
    short_name: 'ClearGuard',
    description: '계약서·문자에 숨은 위험을 AI가 근거와 함께 판독합니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f7f2',
    theme_color: '#f7f7f2',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
