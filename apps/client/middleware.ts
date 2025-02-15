import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 현재 요청의 경로
  const path = request.nextUrl.pathname;

  // 공개 경로 (인증 불필요)
  const isPublicPath = path === '/auth';

  // access_token 쿠키 확인
  const token = request.cookies.get('access_token')?.value;

  // 인증되지 않은 사용자가 보호된 경로에 접근하려는 경우
  if (!token && !isPublicPath) {
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }

  // 이미 인증된 사용자가 /auth 페이지에 접근하려는 경우
  if (token && path === '/auth') {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Middleware가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - docs (public documentation)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|images).*)',
  ],
};
