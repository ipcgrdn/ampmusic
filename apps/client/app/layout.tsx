import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from '@/context/auth-context';
import { MainLayout } from '@/components/layout/main-layout';
import { ToastProvider } from '@/components/ui/toast';
import { QueryProvider } from "@/providers/query-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { InitialDataLoader } from '@/components/notification/initial-data-loader';
import { ErrorBoundary } from '@/components/error-boundary';
import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";

// viewport 설정을 별도로 분리
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "AMP - Alternative Music Platform",
    template: "%s | AMP"
  },
  description: "아티스트와 팬을 위한 새로운 음악 플랫폼, AMP에서 당신의 음악을 공유하세요",
  keywords: [
    "음악", "스트리밍", "아티스트", "음악 플랫폼", "음악 공유",
    "인디음악", "Alternative", "Music", "Platform"
  ],
  authors: [{ name: "AMP Team" }],
  creator: "AMP Team",
  publisher: "AMP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "AMP - Alternative Music Platform",
    title: "AMP - Alternative Music Platform",
    description: "아티스트와 팬을 위한 새로운 음악 플랫폼",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AMP - Alternative Music Platform",
    description: "아티스트와 팬을 위한 새로운 음악 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  verification: {
    google: "google-site-verification=YOUR_CODE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white">
        <NuqsAdapter>
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                <InitialDataLoader />
                <ToastProvider>
                  <Suspense fallback={<Loading />}>
                    <MainLayout>{children}</MainLayout>
                  </Suspense>
                </ToastProvider>
              </ErrorBoundary>
            </AuthProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
