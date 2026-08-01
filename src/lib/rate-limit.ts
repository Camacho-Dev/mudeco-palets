const buckets = new Map<string, { count: number; start: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
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
