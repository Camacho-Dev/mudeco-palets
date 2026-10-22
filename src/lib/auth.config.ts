import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminPath, isPublicPath } from "@/lib/sensitive";
import { homeForRole, isAdmin } from "@/lib/rbac";

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
      const isStripeWebhook = pathname.startsWith("/api/stripe/webhook");
      const role =
        (auth?.user as { role?: string } | undefined)?.role ||
        (auth as { role?: string } | null)?.role;

      if (isStripeWebhook) return true;

      if (isPublicPath(pathname) || isLogin) {
        if (isLoggedIn && isLogin) {
          return NextResponse.redirect(
            new URL(homeForRole(role), request.nextUrl.origin),
          );
        }
        return true;
      }

      if (!isLoggedIn) {
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      if (isAdminPath(pathname) && !isAdmin(role)) {
        return NextResponse.redirect(
          new URL("/vender?error=sin-permiso", request.nextUrl.origin),
        );
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
