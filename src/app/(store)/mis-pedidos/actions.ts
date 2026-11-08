"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDualRateLimit } from "@/lib/rate-limit";

export async function updateMyAccountAction(formData: FormData): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: "Debes iniciar sesión." };
  }

  const email = session.user.email.toLowerCase().trim();
  const rl = await checkDualRateLimit({
    scope: "account-update",
    identifier: email,
    ipLimit: 10,
    idLimit: 6,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return {
      ok: false,
      error: "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (!name || name.length < 2 || name.length > 100) {
    return { ok: false, error: "Ingresa un nombre válido (2 a 100 caracteres)." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { ok: false, error: "Cuenta no encontrada o inactiva." };
  }

  const updateData: {
    name: string;
    phone?: string | null;
    address?: string | null;
    passwordHash?: string;
  } = {
    name,
    phone: phone || null,
    address: address || null,
  };

  if (newPassword.trim().length > 0) {
    if (newPassword.length < 6 || newPassword.length > 128) {
      return {
        ok: false,
        error: "La nueva contraseña debe tener entre 6 y 128 caracteres.",
      };
    }
    if (user.passwordHash) {
      if (!currentPassword) {
        return {
          ok: false,
          error: "Ingresa tu contraseña actual para confirmar el cambio.",
        };
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return { ok: false, error: "La contraseña actual no es correcta." };
      }
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  await prisma.customer
    .updateMany({
      where: { email: { equals: email, mode: "insensitive" } },
      data: {
        name,
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
    })
    .catch(() => null);

  revalidatePath("/", "layout");
  revalidatePath("/mis-pedidos");
  return {
    ok: true,
    message: updateData.passwordHash
      ? "Perfil, datos de contacto y contraseña actualizados correctamente."
      : "Datos de tu perfil actualizados correctamente.",
  };
}

