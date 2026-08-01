import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isSensitivePath, verifySensitiveToken, SENSITIVE_COOKIE } from "@/lib/sensitive";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLogin = pathname.startsWith("/login");
  const isUnlock = pathname.startsWith("/desbloquear");

  if (!isLoggedIn && !isLogin) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isLogin) {
    return NextResponse.redirect(new URL("/vender", req.nextUrl.origin));
  }

  if (isLoggedIn && isSensitivePath(pathname) && !isUnlock) {
    const token = req.cookies.get(SENSITIVE_COOKIE)?.value;
    if (!(await verifySensitiveToken(token))) {
      const url = new URL("/desbloquear", req.nextUrl.origin);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
