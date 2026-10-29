"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { validateDominicanTaxId } from "@/lib/rnc-validator";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  taxId: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

function parseSupplierForm(fd: FormData) {
  const rawTaxId = String(fd.get("taxId") || "").trim() || undefined;
  if (rawTaxId) {
    const taxCheck = validateDominicanTaxId(rawTaxId);
    if (!taxCheck.valid && taxCheck.error) {
      throw new Error(taxCheck.error);
    }
  }
  return schema.parse({
    name: String(fd.get("name") || "").trim(),
    taxId: rawTaxId,
    email: String(fd.get("email") || "").trim(),
    phone: String(fd.get("phone") || "").trim() || undefined,
    address: String(fd.get("address") || "").trim() || undefined,
  });
}

export async function createSupplier(fd: FormData) {
  await requireAdmin();
  const data = parseSupplierForm(fd);
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
  const data = parseSupplierForm(fd);
  await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      taxId: data.taxId || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    },
  });
  await writeAudit({
    action: "UPDATE",
    entity: "Supplier",
    entityId: id,
    summary: `Proveedor actualizado: ${data.name}`,
  });
  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${id}`);
  redirect(`/proveedores/${id}`);
}

export async function deleteSupplier(id: string) {
  await requireAdmin();
  const purchasesCount = await prisma.purchase.count({
    where: { supplierId: id },
  });
  if (purchasesCount > 0) {
    throw new Error(
      "No se puede eliminar este proveedor porque ya tiene órdenes de compra registradas",
    );
  }
  const supplier = await prisma.supplier.delete({ where: { id } });
  await writeAudit({
    action: "DELETE",
    entity: "Supplier",
    entityId: id,
    summary: `Proveedor eliminado: ${supplier.name}`,
  });
  revalidatePath("/proveedores");
  redirect("/proveedores");
}
