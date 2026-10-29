"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  slogan: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export async function updateCompany(fd: FormData) {
  await requireAdmin();
  const data = schema.parse({
    name: String(fd.get("name") || ""),
    slogan: String(fd.get("slogan") || "") || undefined,
    taxId: String(fd.get("taxId") || "") || undefined,
    address: String(fd.get("address") || "") || undefined,
    phone: String(fd.get("phone") || "") || undefined,
    email: String(fd.get("email") || "") || undefined,
  });

  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "Company",
    entityId: "default",
    summary: `Datos de empresa actualizados: ${data.name}`,
  });

  revalidatePath("/configuracion");
  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/panel");
  redirect("/configuracion");
}

export async function createNcfSeries(fd: FormData) {
  await requireAdmin();
  const type = String(fd.get("type") || "").toUpperCase();
  const name = String(fd.get("name") || type);
  const prefix = String(fd.get("prefix") || type);
  const nextSeq = Number(fd.get("nextSeq") || 1);
  const maxSeq = Number(fd.get("maxSeq") || 99999999);
  const expiresAtRaw = String(fd.get("expiresAt") || "");

  if (!type || !prefix) throw new Error("Tipo y prefijo requeridos");

  await prisma.ncfSeries.create({
    data: {
      type,
      name,
      prefix,
      nextSeq,
      maxSeq,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      active: true,
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "NcfSeries",
    summary: `Serie NCF ${type} creada (${prefix})`,
  });
  revalidatePath("/configuracion");
  revalidatePath("/panel");
  redirect("/configuracion");
}

export async function toggleNcfSeriesActive(id: string) {
  await requireAdmin();
  const series = await prisma.ncfSeries.findUnique({ where: { id } });
  if (!series) throw new Error("Serie NCF no encontrada");

  const updated = await prisma.ncfSeries.update({
    where: { id },
    data: { active: !series.active },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "NcfSeries",
    entityId: id,
    summary: `Serie NCF ${updated.type} (${updated.prefix}) ${updated.active ? "activada" : "desactivada"}`,
  });

  revalidatePath("/configuracion");
  revalidatePath("/panel");
}

export async function updateNcfSeriesSeq(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") || "");
  const nextSeq = Number(fd.get("nextSeq") || 1);
  const maxSeq = Number(fd.get("maxSeq") || 99999999);

  if (!id || nextSeq < 1 || maxSeq < nextSeq) {
    throw new Error("Secuencia NCF inválida");
  }

  const updated = await prisma.ncfSeries.update({
    where: { id },
    data: { nextSeq, maxSeq },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "NcfSeries",
    entityId: id,
    summary: `Secuencia NCF ${updated.type} actualizada: siguiente ${nextSeq}, máx ${maxSeq}`,
  });

  revalidatePath("/configuracion");
  revalidatePath("/panel");
}

export async function deleteNcfSeries(id: string) {
  await requireAdmin();
  const existing = await prisma.ncfSeries.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.ncfSeries.delete({ where: { id } });

  await writeAudit({
    action: "DELETE",
    entity: "NcfSeries",
    entityId: id,
    summary: `Serie NCF eliminada: ${existing.type} (${existing.prefix})`,
  });

  revalidatePath("/configuracion");
  revalidatePath("/panel");
}
