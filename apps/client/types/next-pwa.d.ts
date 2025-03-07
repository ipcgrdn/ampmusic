declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  export interface PWAOptions {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: Array<string | RegExp>;
    scope?: string;
    sw?: string;
    runtimeCaching?: Array<{
      urlPattern: RegExp;
      handler: string;
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        cacheableResponse?: {
          statuses?: number[];
          headers?: { [key: string]: string };
        };
      };
    }>;
  }
  
  export default function withPWA(options?: PWAOptions): (config: NextConfig) => NextConfig;
} 