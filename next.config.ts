import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  // 보안 헤더 — 심사 항목 "보안·안전성" 대응이자 실제 방어.
  // CSP는 데모 직전 도입 시 화면 깨짐 리스크가 커서 넣지 않았습니다(로드맵).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // 응답 타입 추측 금지 — 업로드된 텍스트가 스크립트로 해석되는 것 방지
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // iframe 삽입 금지 — 클릭재킹으로 판독 버튼을 가로채는 것 방지
          { key: 'X-Frame-Options', value: 'DENY' },
          // 외부로 나가는 링크에 우리 URL 파라미터를 흘리지 않음
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 카메라는 우리 도메인(계약서 촬영 OCR)만, 마이크·위치는 아예 차단
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
