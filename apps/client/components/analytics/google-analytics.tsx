'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// window 객체에 gtag 속성 추가
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const GA_TRACKING_ID = 'G-2CPLLC2PW9';

  // 초기 마운트와 GA 스크립트 로드
  useEffect(() => {
    setMounted(true);
    
    // Google Analytics 스크립트 추가
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);

    // 컴포넌트 언마운트시 스크립트 제거
    return () => {
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
    };
  }, []);

  // 페이지 변경 시 페이지뷰 이벤트 전송
  useEffect(() => {
    if (!mounted) return;
    
    // 현재 URL에서 쿼리 파라미터 추출
    const searchParams = window.location.search;
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_search: searchParams,
      });
    }
  }, [pathname, mounted]);

  return null;
} 