import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const authMiddleware = NextAuth(authConfig).auth;

type EdgeBucket = { count: number; resetAt: number };
const edgeBuckets = new Map<string, EdgeBucket>();
const MAX_EDGE_BUCKETS = 4000;

function checkEdgeRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
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
    return { ok: false, retryAfter: Math.max(1, Math.ceil((cur.resetAt - now) / 1000)) };
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

export default authMiddleware((req) => {
  const pathname = req.nextUrl.pathname;

  // Excluir el webhook firmado de Stripe del limitador por IP
  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  const ip = extractEdgeIp(req);
  const method = req.method.toUpperCase();

  // Protección estricta contra ráfagas de mutaciones POST / Server Actions / Uploads (máx 45 por minuto por IP)
  if (method === "POST" || method === "PUT" || method === "DELETE") {
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

  // Protección global contra scraping / flooding de peticiones GET (máx 180 por minuto por IP)
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
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
