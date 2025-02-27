import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_URL:
      process.env.NODE_ENV === "production"
        ? "https://api.ampmusic.im"
        : "http://localhost:4000",
  },

  // 법적 페이지의 정적 생성 설정 추가
  output: "standalone",

  // 특정 경로에 대한 페이지 설정 추가
  async redirects() {
    return [];
  },

  // 정적 페이지 생성 최적화
  async headers() {
    return [
      {
        source: "/auth/terms",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/auth/privacy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      // 기존 설정 유지
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
    ],
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

export default nextConfig;