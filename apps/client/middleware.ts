import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 현재 요청의 경로
  const path = request.nextUrl.pathname;

  // 법적 페이지는 항상 먼저 처리하여 접근을 보장
  if (path === "/auth/privacy" || path === "/auth/terms") {
    return NextResponse.next();
  }

  // 로그인 페이지 확인
  const isLoginPath = path === "/auth";

  // access_token 쿠키 확인
  const token = request.cookies.get("access_token")?.value;

  // 인증되지 않은 사용자가 보호된 경로에 접근하려는 경우
  if (!token && !isLoginPath) {
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  // 이미 인증된 사용자가 /auth 페이지에 접근하려는 경우
  if (token && path === "/auth") {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|images).*)",
  ],
};