"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { canDeleteCustomer } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateDominicanTaxId } from "@/lib/rnc-validator";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  taxId: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
});

function formDataToCustomer(fd: FormData) {
  const rawTaxId = String(fd.get("taxId") || "").trim() || undefined;
  if (rawTaxId) {
    const taxCheck = validateDominicanTaxId(rawTaxId);
    if (!taxCheck.valid && taxCheck.error) {
      throw new Error(taxCheck.error);
    }
  }

  const rawEmail = String(fd.get("email") || "").trim() || undefined;

  return customerSchema.parse({
    name: String(fd.get("name") || "").trim(),
    taxId: rawTaxId,
    email: rawEmail,
    phone: String(fd.get("phone") || "").trim() || undefined,
    address: String(fd.get("address") || "").trim() || undefined,
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
  const [invoices, quotes, creditNotes, webOrders] = await Promise.all([
    prisma.invoice.count({ where: { customerId: id } }),
    prisma.quote.count({ where: { customerId: id } }),
    prisma.creditNote.count({ where: { customerId: id } }),
    prisma.webOrder.count({ where: { customerId: id } }),
  ]);
  if (invoices > 0 || quotes > 0 || creditNotes > 0 || webOrders > 0) {
    throw new Error(
      "No se puede eliminar: el cliente tiene facturas, cotizaciones o pedidos asociados",
    );
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
