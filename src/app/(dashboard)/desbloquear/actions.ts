"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  SENSITIVE_COOKIE,
  SENSITIVE_TTL_MS,
  createSensitiveToken,
} from "@/lib/sensitive";

export async function unlockSensitiveArea(fd: FormData) {
  const session = await requireSession();
  const password = String(fd.get("password") || "");
  const next = String(fd.get("next") || "/");

  if (!password) {
    return { error: "Ingresa la contraseña de administrador" };
  }

  const rl = checkRateLimit(
    `unlock:${session.user.id}`,
    5,
    15 * 60 * 1000,
  );
  if (!rl.ok) {
    return {
      error: `Demasiados intentos. Espera ${rl.retryAfterSec}s`,
    };
  }

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", active: true },
    orderBy: { createdAt: "asc" },
  });

  if (!admin) {
    return { error: "No hay administrador configurado" };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await writeAudit({
      action: "UNLOCK_DENIED",
      entity: "System",
      summary: "Intento fallido de desbloquear área privada",
      details: { by: session.user.email },
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
    });
    return { error: "Contraseña de administrador incorrecta" };
  }

  const token = await createSensitiveToken();
  const jar = await cookies();
  jar.set(SENSITIVE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SENSITIVE_TTL_MS / 1000),
  });

  await writeAudit({
    action: "UNLOCK_SENSITIVE",
    entity: "System",
    summary: "Área privada desbloqueada con clave de administrador",
    details: { unlockedBy: session.user.email, adminEmail: admin.email },
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  });

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(safeNext);
}

export async function lockSensitiveArea() {
  const session = await requireSession();
  const jar = await cookies();
  jar.delete(SENSITIVE_COOKIE);

  await writeAudit({
    action: "LOCK_SENSITIVE",
    entity: "System",
    summary: "Área privada bloqueada manualmente",
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  });

  redirect("/vender");
}
