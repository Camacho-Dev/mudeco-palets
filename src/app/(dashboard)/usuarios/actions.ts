"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "VENDEDOR"]),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
});

export async function createUser(fd: FormData) {
  await requireAdmin();
  const data = schema.parse({
    name: String(fd.get("name") || ""),
    email: String(fd.get("email") || "").toLowerCase(),
    password: String(fd.get("password") || ""),
    role: String(fd.get("role") || "VENDEDOR"),
    commissionRate: fd.get("commissionRate") || 0,
  });

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: data.role,
      commissionRate: data.commissionRate ?? 0,
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    summary: `Usuario creado: ${user.email} (${user.role})`,
  });
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function setUserPassword(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") || "");
  const password = String(fd.get("password") || "");
  if (!id || password.length < 6) throw new Error("Datos inválidos");

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  await writeAudit({
    action: "UPDATE",
    entity: "User",
    entityId: id,
    summary: "Contraseña de usuario actualizada",
  });
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function toggleUserActive(id: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");
  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });
  await writeAudit({
    action: "UPDATE",
    entity: "User",
    entityId: id,
    summary: `Usuario ${updated.active ? "activado" : "desactivado"}: ${updated.email}`,
  });
  revalidatePath("/usuarios");
}
