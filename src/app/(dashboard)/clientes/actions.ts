"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { canDeleteCustomer } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
});

function formDataToCustomer(fd: FormData) {
  return customerSchema.parse({
    name: String(fd.get("name") || ""),
    taxId: String(fd.get("taxId") || "") || undefined,
    email: String(fd.get("email") || "") || undefined,
    phone: String(fd.get("phone") || "") || undefined,
    address: String(fd.get("address") || "") || undefined,
    creditLimit: fd.get("creditLimit") || 0,
  });
}

export async function createCustomer(fd: FormData) {
  await requireSession();
  const data = formDataToCustomer(fd);
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      taxId: data.taxId,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      creditLimit: data.creditLimit ?? 0,
    },
  });
  await writeAudit({
    action: "CREATE",
    entity: "Customer",
    entityId: customer.id,
    summary: `Cliente creado: ${customer.name}`,
  });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCustomer(id: string, fd: FormData) {
  await requireSession();
  const data = formDataToCustomer(fd);
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      taxId: data.taxId,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      creditLimit: data.creditLimit ?? 0,
    },
  });
  await writeAudit({
    action: "UPDATE",
    entity: "Customer",
    entityId: id,
    summary: `Cliente actualizado: ${customer.name}`,
  });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}

export async function deleteCustomer(id: string) {
  const session = await requireSession();
  if (!canDeleteCustomer(session.user.role)) {
    throw new Error("Solo el administrador puede eliminar clientes");
  }
  const invoices = await prisma.invoice.count({ where: { customerId: id } });
  if (invoices > 0) {
    throw new Error("No se puede eliminar: el cliente tiene facturas");
  }
  const customer = await prisma.customer.delete({ where: { id } });
  await writeAudit({
    action: "DELETE",
    entity: "Customer",
    entityId: id,
    summary: `Cliente eliminado: ${customer.name}`,
  });
  revalidatePath("/clientes");
  redirect("/clientes");
}
