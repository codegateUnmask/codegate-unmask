import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'unmask — 계약서 위험 분석',
    short_name: 'unmask',
    description: '서명하기 전 계약서의 숨겨진 위험을 확인하는 AI 가이드',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F7F2',
    theme_color: '#202124',
    lang: 'ko',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
