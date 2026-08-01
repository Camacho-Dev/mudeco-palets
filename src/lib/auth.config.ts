import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import {
  isSensitivePath,
  verifySensitiveToken,
  SENSITIVE_COOKIE,
} from "@/lib/sensitive";

/** Config Edge-compatible (sin Prisma/bcrypt) para middleware */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = !!auth;
      const isLogin = pathname.startsWith("/login");
      const isUnlock = pathname.startsWith("/desbloquear");

      if (!isLoggedIn && !isLogin) {
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      if (isLoggedIn && isLogin) {
        return NextResponse.redirect(new URL("/vender", request.nextUrl.origin));
      }

      if (isLoggedIn && isSensitivePath(pathname) && !isUnlock) {
        const token = request.cookies.get(SENSITIVE_COOKIE)?.value;
        if (!(await verifySensitiveToken(token))) {
          const url = new URL("/desbloquear", request.nextUrl.origin);
          url.searchParams.set("next", pathname);
          return NextResponse.redirect(url);
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
