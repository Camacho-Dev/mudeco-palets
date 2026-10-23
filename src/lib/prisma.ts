import { PrismaClient } from "@prisma/client";

function withConnectTimeout(url: string | undefined) {
  if (!url) return url;
  let res = url;
  if (!/[?&]connect_timeout=/.test(res)) {
    res = `${res}${res.includes("?") ? "&" : "?"}connect_timeout=15`;
  }
  if (!/[?&]connection_limit=/.test(res)) {
    res = `${res}&connection_limit=10`;
  }
  if (res.includes("pooler") && !/[?&]pgbouncer=/.test(res)) {
    res = `${res}&pgbouncer=true`;
  }
  return res;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: withConnectTimeout(process.env.DATABASE_URL) },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Reintenta si Neon está despertando (P1001 / P1017). */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  opts?: { retries?: number; fallback?: T },
): Promise<T> {
  const retries = opts?.retries ?? 3;
  let last: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (code !== "P1001" && code !== "P1017") {
        if (opts && "fallback" in opts) return opts.fallback as T;
        throw err;
      }
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  if (opts && "fallback" in opts) return opts.fallback as T;
  throw last;
}
