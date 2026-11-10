import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mudeco_recent_order";
const MAX_AGE_SECONDS = 30 * 60; // 30 minutos
const ephemeralDevSecret = crypto.randomBytes(32).toString("hex");

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  return ephemeralDevSecret;
}

function signOrderId(orderId: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(`order-access:${orderId}`)
    .digest("hex");
  return `${orderId}.${sig}`;
}

export async function grantRecentOrderAccessCookie(orderId: string) {
  try {
    const store = await cookies();
    store.set(COOKIE_NAME, signOrderId(orderId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
  } catch {
    // Ignorar si se invoca fuera de un request mutable
  }
}

export async function hasRecentOrderAccessCookie(orderId: string): Promise<boolean> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_NAME)?.value;
    if (!raw) return false;
    const expected = signOrderId(orderId);
    const bufA = Buffer.from(raw, "utf8");
    const bufB = Buffer.from(expected, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
