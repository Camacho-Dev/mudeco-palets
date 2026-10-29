"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
});

export async function registerCustomer(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos incompletos",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name.trim();

  const rl = checkRateLimit(`register:${email}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      success: false,
      error: "Has intentado registrarte demasiadas veces. Espera unos minutos.",
    };
  }

  // Verificar si ya existe usuario con ese correo
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return {
      success: false,
      error: "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CLIENTE",
      phone: parsed.data.phone?.trim() || null,
      active: true,
      department: "CLIENTE",
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "User",
    entityId: newUser.id,
    summary: `Nueva cuenta de cliente registrada desde la web: ${newUser.name} (${newUser.email})`,
  });

  return { success: true };
}

export async function checkGoogleAuthStatus() {
  return {
    configured: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
  };
}

function computeResetCode(email: string, passwordHash: string, windowSlot: number) {
  const secret = process.env.AUTH_SECRET || "mudeco-reset-secret";
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`${email}:${passwordHash}:${windowSlot}`)
    .digest("hex");
  const num = parseInt(hmac.slice(0, 8), 16) % 900000;
  return String(100000 + num);
}

export async function requestPasswordResetCode(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, error: "Ingresa un correo electrónico válido." };
  }

  const rl = checkRateLimit(`reset-req:${email}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      success: false,
      error: "Demasiados intentos. Espera unos minutos antes de volver a solicitar.",
    };
  }

  if (!isEmailConfigured()) {
    return {
      success: false,
      error: "El servidor de correo SMTP no está configurado.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    // Respuesta uniforme para no revelar cuentas existentes
    return {
      success: true,
      previewUrl: null,
    };
  }

  // Ventana de 15 minutos
  const slot = Math.floor(Date.now() / (15 * 60 * 1000));
  const code = computeResetCode(user.email, user.passwordHash, slot);

  try {
    const { previewUrl } = await sendPasswordResetEmail(
      user.email,
      user.name,
      code,
    );
    return {
      success: true,
      previewUrl,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de recuperación.",
    };
  }
}

export async function resetPasswordWithCode(payload: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const email = payload.email.trim().toLowerCase();
  const code = payload.code.trim();
  const newPassword = payload.newPassword;

  if (!email || !code || newPassword.length < 6) {
    return {
      success: false,
      error: "Completa el código de 6 dígitos y una contraseña de al menos 6 caracteres.",
    };
  }

  const rl = checkRateLimit(`reset-verify:${email}`, 8, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      success: false,
      error: "Demasiados intentos fallidos. Espera 15 minutos.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { success: false, error: "Código inválido o expirado." };
  }

  const currentSlot = Math.floor(Date.now() / (15 * 60 * 1000));
  const validCodes = [
    computeResetCode(user.email, user.passwordHash, currentSlot),
    computeResetCode(user.email, user.passwordHash, currentSlot - 1),
  ];

  if (!validCodes.includes(code)) {
    return {
      success: false,
      error: "El código ingresado es incorrecto o ha expirado.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await writeAudit({
    action: "PASSWORD_RESET",
    entity: "User",
    entityId: user.id,
    summary: `Contraseña restablecida por correo para ${user.email}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
  });

  return { success: true };
}
