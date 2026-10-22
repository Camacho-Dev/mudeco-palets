/**
 * Rate-limiter en memoria con persistencia globalThis.
 *
 * En Vercel/serverless el Map persiste entre invocaciones "calientes"
 * de la misma instancia, pero NO se comparte entre instancias distintas.
 * Para hardening real en producción, sustituir por Upstash Rate Limit:
 *   npm i @upstash/ratelimit @upstash/redis
 *
 * Para la escala actual de Mudeco Palets (pocos usuarios concurrentes)
 * esto es suficiente.
 */

type Bucket = { count: number; start: number };

const globalForRL = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
};

function getBuckets(): Map<string, Bucket> {
  if (!globalForRL.__rateLimitBuckets) {
    globalForRL.__rateLimitBuckets = new Map();
  }
  return globalForRL.__rateLimitBuckets;
}

/** Limpia buckets expirados para evitar memory leak */
function purgeExpired(windowMs: number) {
  const buckets = getBuckets();
  const now = Date.now();
  for (const [key, val] of buckets) {
    if (now - val.start > windowMs) {
      buckets.delete(key);
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

  // Purgar expirados cada vez (es O(n) pero n es pequeño)
  if (buckets.size > 100) {
    purgeExpired(windowMs);
  }

  const cur = buckets.get(key);
  if (!cur || now - cur.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { ok: true };
  }
  if (cur.count >= limit) {
    const retryAfterSec = Math.ceil((cur.start + windowMs - now) / 1000);
    return { ok: false, retryAfterSec };
  }
  cur.count += 1;
  return { ok: true };
}
