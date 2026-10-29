import { headers } from "next/headers";

/**
 * Rate-limiter en memoria con persistencia globalThis, expiración individual por ventana
 * y cota máxima de memoria (MAX_BUCKETS) contra ataques de agotamiento de RAM.
 */

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 5000;

const globalForRL = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
};

function getBuckets(): Map<string, Bucket> {
  if (!globalForRL.__rateLimitBuckets) {
    globalForRL.__rateLimitBuckets = new Map();
  }
  return globalForRL.__rateLimitBuckets;
}

/** Limpia buckets expirados y aplica cota máxima para impedir memory leaks (DoS) */
function purgeExpired() {
  const buckets = getBuckets();
  const now = Date.now();
  for (const [key, val] of buckets) {
    if (now >= val.resetAt) {
      buckets.delete(key);
    }
  }
  if (buckets.size >= MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS + 250;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec?: number } {
  const buckets = getBuckets();
  const now = Date.now();

  if (buckets.size > 200) {
    purgeExpired();
  }

  const cur = buckets.get(key);
  if (!cur || now >= cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (cur.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((cur.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }
  cur.count += 1;
  return { ok: true };
}

/** Obtiene la IP real del cliente en Server Actions / Route Handlers */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const first = xff.split(",")[0]?.trim();
      if (first) return first.slice(0, 64);
    }
    const realIp = h.get("x-real-ip") || h.get("cf-connecting-ip");
    if (realIp) return realIp.trim().slice(0, 64);
  } catch {
    // En contextos fuera de request HTTP
  }
  return "unknown-ip";
}

/**
 * Verifica simultáneamente el límite por IP del cliente y por identificador (email/id),
 * impidiendo que un atacante evada el rate-limit rotando correos falsos desde la misma IP.
 */
export async function checkDualRateLimit(opts: {
  scope: string;
  identifier: string;
  ipLimit: number;
  idLimit: number;
  windowMs: number;
}): Promise<{ ok: boolean; retryAfterSec?: number }> {
  const ip = await getClientIp();
  if (ip !== "unknown-ip") {
    const ipCheck = checkRateLimit(`${opts.scope}:ip:${ip}`, opts.ipLimit, opts.windowMs);
    if (!ipCheck.ok) return ipCheck;
  }
  const cleanId = opts.identifier.trim().toLowerCase().slice(0, 120) || "anon";
  return checkRateLimit(`${opts.scope}:id:${cleanId}`, opts.idLimit, opts.windowMs);
}
