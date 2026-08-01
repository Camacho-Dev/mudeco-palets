export const SENSITIVE_COOKIE = "mudeco_priv";
export const SENSITIVE_TTL_MS = 45 * 60 * 1000; // 45 minutos

/** Rutas del grupo privado (requieren clave admin) */
export const SENSITIVE_PREFIXES = [
  "/finanzas",
  "/inventario",
  "/pagos",
  "/configuracion",
  "/auditoria",
  "/usuarios",
  "/proveedores",
  "/compras",
  "/notas-credito",
  "/fabricacion",
  "/materiales",
  "/exportar",
  "/backup",
] as const;

export function isSensitivePath(pathname: string) {
  if (pathname === "/") return true;
  return SENSITIVE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET es obligatorio en producción");
    }
    return "dev-secret-change-in-production";
  }
  return s;
}

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(sig);
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function createSensitiveToken(
  expiresAt = Date.now() + SENSITIVE_TTL_MS,
) {
  const payload = String(expiresAt);
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

export async function verifySensitiveToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = await hmacHex(payload);
  return timingSafeEqualHex(sig, expected);
}
