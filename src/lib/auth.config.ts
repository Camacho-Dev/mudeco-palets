import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminPath, isPublicPath } from "@/lib/sensitive";
import { isAdmin, isStaff } from "@/lib/rbac";

const isProd = process.env.NODE_ENV === "production";
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (!isProd ? "mudeco-dev-only-secret-change-in-production-32chars" : undefined);

if (isProd && !authSecret) {
  throw new Error("AUTH_SECRET o NEXTAUTH_SECRET debe estar definido en producción.");
}

/** Config Edge-compatible (sin Prisma/bcrypt) para proxy/middleware */
export const authConfig = {
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 horas
    updateAge: 60 * 60, // rotación cada 1 hora
  },
  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
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
      const isAuthApi = pathname.startsWith("/api/auth");
      const isStripeWebhook = pathname.startsWith("/api/stripe/webhook");
      const isInvoicePdf =
        pathname.startsWith("/api/facturas/") && pathname.endsWith("/pdf");
      const isQuotePdf =
        pathname.startsWith("/api/cotizaciones/") && pathname.endsWith("/pdf");
      const role =
        (auth?.user as { role?: string } | undefined)?.role ||
        (auth as { role?: string } | null)?.role;

      if (isAuthApi || isStripeWebhook || isInvoicePdf || isQuotePdf) {
        return true;
      }

      if (isPublicPath(pathname) || isLogin) {
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
