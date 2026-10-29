import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminPath, isPublicPath } from "@/lib/sensitive";
import { homeForRole, isAdmin, isStaff } from "@/lib/rbac";

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
      const isInvoicePdf =
        pathname.startsWith("/api/facturas/") && pathname.endsWith("/pdf");
      const isQuotePdf =
        pathname.startsWith("/api/cotizaciones/") && pathname.endsWith("/pdf");
      const role =
        (auth?.user as { role?: string } | undefined)?.role ||
        (auth as { role?: string } | null)?.role;

      if (isStripeWebhook || isInvoicePdf || isQuotePdf) return true;

      if (isPublicPath(pathname) || isLogin) {
        if (isLoggedIn && isLogin) {
          const callback = request.nextUrl.searchParams.get("callbackUrl");
          const safeCallback =
            callback &&
            callback.startsWith("/") &&
            !callback.startsWith("//") &&
            callback !== "/login"
              ? callback
              : null;
          return NextResponse.redirect(
            new URL(safeCallback || homeForRole(role), request.nextUrl.origin),
          );
        }
        return true;
      }

      if (!isLoggedIn) {
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Bloquear clientes web (rol CLIENTE) de entrar al sistema ERP interno
      if (!isStaff(role)) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin));
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
