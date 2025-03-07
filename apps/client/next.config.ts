import type { NextConfig } from "next";
import withPWA from 'next-pwa';

// 빌드 타임스탬프 생성 (캐시 버스팅에 사용)
const buildId = Date.now().toString();

// 기본 Next.js 구성
const nextConfig: NextConfig = {
  env: {
    API_URL:
      process.env.NODE_ENV === "production"
        ? "https://api.ampmusic.im"
        : "http://localhost:4000",
    // 클라이언트에서 접근 가능한 빌드 ID 추가
    BUILD_ID: buildId,
  },

  // 매 빌드마다 고유 ID 생성 (핵심 캐시 버스팅 기능)
  generateBuildId: async () => {
    return buildId;
  },

  // 법적 페이지의 정적 생성 설정 추가
  output: "standalone",

  // 특정 경로에 대한 페이지 설정 추가
  async redirects() {
    return [
      {
        // manifest.webmanifest 요청을 manifest.json으로 리디렉션
        source: '/manifest.webmanifest',
        destination: '/manifest.json',
        permanent: true
      }
    ];
  },

  // 정적 페이지 생성 최적화 및 캐시 헤더 설정
  async headers() {
    return [
      {
        // 매니페스트 파일을 위한 적절한 MIME 타입 설정
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        // 모든 Next.js 정적 자산에 대한 캐시 제어
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // 모든 페이지에 대한 기본 캐시 설정
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // 법적 페이지 설정 - 캐시 시간 단축
        source: "/auth/terms",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/auth/privacy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },

  // 보안 및 성능 향상을 위한 추가 설정
  poweredByHeader: false, // X-Powered-By 헤더 제거
  reactStrictMode: true, // 엄격 모드 활성화

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/avatars/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/audio/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.ampmusic.im",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.ampmusic.im",
        pathname: "/**",
      }
    ],
    domains: ["cdn.ampmusic.im", "api.ampmusic.im"],  // 추가적인 보안을 위한 도메인 허용 목록
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  devIndicators: {
    appIsrStatus: false,
  },
};

// PWA로 Next.js 구성 감싸기
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // 필요한 경우 추가 PWA 설정
})(nextConfig);