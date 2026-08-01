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
  redirect("/configuracion");
}
