import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminPath } from "@/lib/sensitive";
import { ROLES } from "@/lib/rbac";

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
      const role =
        (auth?.user as { role?: string } | undefined)?.role ||
        (auth as { role?: string } | null)?.role;

      if (!isLoggedIn && !isLogin) {
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      if (isLoggedIn && isLogin) {
        return NextResponse.redirect(
          new URL("/vender", request.nextUrl.origin),
        );
      }

      if (isLoggedIn && isAdminPath(pathname) && role !== ROLES.ADMIN) {
        return NextResponse.redirect(
          new URL("/vender?error=sin-permiso", request.nextUrl.origin),
        );
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
