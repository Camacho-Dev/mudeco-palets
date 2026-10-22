"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function restoreBackup(fd: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const file = fd.get("backupFile") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Selecciona un archivo JSON de respaldo");
  }

  const text = await file.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("El archivo no contiene un formato JSON válido");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Estructura de respaldo inválida");
  }

  let restoredCustomers = 0;
  let restoredProducts = 0;
  let restoredSuppliers = 0;

  // Restaurar clientes
  if (Array.isArray(data.customers)) {
    for (const c of data.customers) {
      if (!c.id || !c.name) continue;
      await prisma.customer.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          name: c.name,
          taxId: c.taxId || null,
          email: c.email || null,
          phone: c.phone || null,
          address: c.address || null,
          creditLimit: c.creditLimit || 0,
        },
        update: {
          name: c.name,
          taxId: c.taxId || null,
          phone: c.phone || null,
          address: c.address || null,
          creditLimit: c.creditLimit || 0,
        },
      });
      restoredCustomers++;
    }
  }

  // Restaurar proveedores
  if (Array.isArray(data.suppliers)) {
    for (const s of data.suppliers) {
      if (!s.id || !s.name) continue;
      await prisma.supplier.upsert({
        where: { id: s.id },
        create: {
          id: s.id,
          name: s.name,
          taxId: s.taxId || null,
          email: s.email || null,
          phone: s.phone || null,
          address: s.address || null,
        },
        update: {
          name: s.name,
          taxId: s.taxId || null,
          phone: s.phone || null,
          address: s.address || null,
        },
      });
      restoredSuppliers++;
    }
  }

  // Restaurar catálogo de productos
  if (Array.isArray(data.products)) {
    for (const p of data.products) {
      if (!p.id || !p.name) continue;
      await prisma.product.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          sku: p.sku || null,
          name: p.name,
          description: p.description || null,
          kind: p.kind || "FINISHED",
          category: p.category || "Muebles",
          price: Number(p.price) || 0,
          cost: Number(p.cost) || 0,
          taxRate: Number(p.taxRate) || 0.18,
          unit: p.unit || "UND",
          stock: Number(p.stock) || 0,
          minStock: Number(p.minStock) || 2,
          active: p.active ?? true,
          imageUrl: p.imageUrl || null,
          widthCm: p.widthCm || null,
          heightCm: p.heightCm || null,
          depthCm: p.depthCm || null,
        },
        update: {
          name: p.name,
          description: p.description || null,
          price: Number(p.price) || 0,
          cost: Number(p.cost) || 0,
          unit: p.unit || "UND",
          category: p.category || "Muebles",
        },
      });
      restoredProducts++;
    }
  }

  // Restaurar configuración de empresa
  if (data.settings && typeof data.settings === "object") {
    await prisma.companySettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        name: data.settings.name || "Mudeco Palets",
        slogan: data.settings.slogan || "Muebles a la medida",
        taxId: data.settings.taxId || null,
        phone: data.settings.phone || null,
        email: data.settings.email || null,
        address: data.settings.address || null,
      },
      update: {
        name: data.settings.name || undefined,
        slogan: data.settings.slogan || undefined,
        taxId: data.settings.taxId || undefined,
        phone: data.settings.phone || undefined,
        email: data.settings.email || undefined,
        address: data.settings.address || undefined,
      },
    });
  }

  await writeAudit({
    action: "RESTORE",
    entity: "System",
    summary: `Restauración de catálogo y clientes: ${restoredProducts} productos, ${restoredCustomers} clientes, ${restoredSuppliers} proveedores`,
  });

  revalidatePath("/clientes");
  revalidatePath("/productos");
  revalidatePath("/proveedores");
  revalidatePath("/configuracion");
  revalidatePath("/panel");

  return {
    ok: true,
    message: `Restauración exitosa: ${restoredProducts} productos, ${restoredCustomers} clientes y ${restoredSuppliers} proveedores sincronizados.`,
  };
}
