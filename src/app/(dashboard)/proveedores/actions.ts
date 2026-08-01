"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  taxId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function createSupplier(fd: FormData) {
  await requireAdmin();
  const data = schema.parse({
    name: String(fd.get("name") || ""),
    taxId: String(fd.get("taxId") || "") || undefined,
    email: String(fd.get("email") || ""),
    phone: String(fd.get("phone") || "") || undefined,
    address: String(fd.get("address") || "") || undefined,
  });
  const s = await prisma.supplier.create({
    data: {
      name: data.name,
      taxId: data.taxId,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    },
  });
  await writeAudit({
    action: "CREATE",
    entity: "Supplier",
    entityId: s.id,
    summary: `Proveedor creado: ${s.name}`,
  });
  revalidatePath("/proveedores");
  redirect("/proveedores");
}

export async function updateSupplier(id: string, fd: FormData) {
  await requireAdmin();
  const data = schema.parse({
    name: String(fd.get("name") || ""),
    taxId: String(fd.get("taxId") || "") || undefined,
    email: String(fd.get("email") || ""),
    phone: String(fd.get("phone") || "") || undefined,
    address: String(fd.get("address") || "") || undefined,
  });
  await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      taxId: data.taxId,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    },
  });
  await writeAudit({
    action: "UPDATE",
    entity: "Supplier",
    entityId: id,
    summary: `Proveedor actualizado: ${data.name}`,
  });
  revalidatePath("/proveedores");
  redirect(`/proveedores/${id}`);
}
