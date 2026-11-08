import { PrismaClient } from "@prisma/client";

function withConnectTimeout(url: string | undefined) {
  if (!url) return url;
  let res = url;
  if (!/[?&]connect_timeout=/.test(res)) {
    res = `${res}${res.includes("?") ? "&" : "?"}connect_timeout=15`;
  }
  if (!/[?&]connection_limit=/.test(res)) {
    res = `${res}&connection_limit=15`;
  }
  if (!/[?&]pool_timeout=/.test(res)) {
    res = `${res}&pool_timeout=20`;
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

globalForPrisma.prisma = prisma;

function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code?: string }).code) : "";
  if (code === "P1001" || code === "P1002" || code === "P1008" || code === "P1017" || code === "P2024") {
    return true;
  }
  const msg = "message" in err ? String((err as { message?: string }).message) : "";
  return /Can't reach database|closed the connection|Connection terminated|Timed out fetching a new connection|ECONNRESET|ETIMEDOUT/i.test(
    msg,
  );
}

/** Reintenta automáticamente si la conexión serverless de base de datos está despertando. */
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
      if (!isTransientDbError(err)) {
        if (opts && "fallback" in opts) return opts.fallback as T;
        throw err;
      }
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  if (opts && "fallback" in opts) return opts.fallback as T;
  throw last;
}
