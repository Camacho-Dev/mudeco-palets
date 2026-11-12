import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const authMiddleware = NextAuth(authConfig).auth;

type EdgeBucket = { count: number; resetAt: number };
const edgeBuckets = new Map<string, EdgeBucket>();
const MAX_EDGE_BUCKETS = 4000;

const BLOCKED_PROBE_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/xmlrpc\.php/i,
  /^\/phpmyadmin/i,
  /^\/phpinfo/i,
  /\.(?:php|asp|aspx|jsp|cgi|env|sql|bak)$/i,
];

function checkEdgeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (edgeBuckets.size > 500) {
    for (const [k, v] of edgeBuckets) {
      if (now >= v.resetAt) edgeBuckets.delete(k);
    }
    if (edgeBuckets.size >= MAX_EDGE_BUCKETS) {
      let n = 0;
      for (const k of edgeBuckets.keys()) {
        edgeBuckets.delete(k);
        if (++n >= 500) break;
      }
    }
  }

  const cur = edgeBuckets.get(key);
  if (!cur || now >= cur.resetAt) {
    edgeBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (cur.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((cur.resetAt - now) / 1000)),
    };
  }
  cur.count += 1;
  return { ok: true, retryAfter: 0 };
}

function extractEdgeIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "local"
  ).slice(0, 64);
}

function isSameOriginMutation(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Peticiones same-origin sin cabecera Origin (ej. navegaciones internas)
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const targetHost = (
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      req.nextUrl.host
    )
      .split(",")[0]
      ?.trim()
      .toLowerCase();
    return Boolean(targetHost && originHost === targetHost);
  } catch {
    return false;
  }
}

export default authMiddleware((req) => {
  try {
    const pathname = req.nextUrl.pathname;

    // 1. Bloqueo inmediato en Edge contra escáneres de vulnerabilidades y path traversal
    if (
      pathname.includes("..") ||
      pathname.toLowerCase().includes("%2e%2e") ||
      BLOCKED_PROBE_PATTERNS.some((rx) => rx.test(pathname))
    ) {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    // Excluir el webhook firmado criptográficamente de Stripe del limitador por IP y chequeo Origin
    if (pathname.startsWith("/api/stripe/webhook")) {
      return NextResponse.next();
    }

    const ip = extractEdgeIp(req);
    const method = req.method.toUpperCase();

    // 2. Validación anti-CSRF por cabecera Origin en todas las mutaciones
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
      if (!isSameOriginMutation(req)) {
        return NextResponse.json(
          { error: "Solicitud bloqueada por política de origen (CSRF)." },
          { status: 403 },
        );
      }

      // Límite estricto sobre intentos de autenticación (/api/auth/* o /login)
      if (pathname.startsWith("/api/auth") || pathname.startsWith("/login")) {
        const authRl = checkEdgeRateLimit(`auth:${ip}`, 20, 5 * 60_000);
        if (!authRl.ok) {
          return new NextResponse(
            JSON.stringify({
              error: "Demasiados intentos de autenticación. Espera unos minutos.",
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(authRl.retryAfter),
              },
            },
          );
        }
      }

      // Protección estricta contra ráfagas de mutaciones POST / Server Actions / Uploads (máx 45 por minuto por IP)
      const postRl = checkEdgeRateLimit(`post:${ip}`, 45, 60_000);
      if (!postRl.ok) {
        return new NextResponse(
          JSON.stringify({
            error: "Demasiadas solicitudes seguidas. Por favor espera unos segundos.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(postRl.retryAfter),
            },
          },
        );
      }
    }

    // 3. Protección global contra scraping / flooding de peticiones GET (máx 180 por minuto por IP)
    const getRl = checkEdgeRateLimit(`req:${ip}`, 180, 60_000);
    if (!getRl.ok) {
      return new NextResponse("Demasiadas solicitudes. Intenta nuevamente en un minuto.", {
        status: 429,
        headers: {
          "Retry-After": String(getRl.retryAfter),
        },
      });
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Edge exception safely caught:", err);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
