"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

type BackupPayload = {
  customers?: Array<{
    id?: string;
    name?: string;
    taxId?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    creditLimit?: number;
  }>;
  suppliers?: Array<{
    id?: string;
    name?: string;
    taxId?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }>;
  products?: Array<{
    id?: string;
    sku?: string | null;
    name?: string;
    description?: string | null;
    kind?: string;
    category?: string;
    price?: number;
    cost?: number;
    taxRate?: number;
    unit?: string;
    stock?: number;
    minStock?: number;
    active?: boolean;
    imageUrl?: string | null;
    widthCm?: number | null;
    heightCm?: number | null;
    depthCm?: number | null;
  }>;
  ncfSeries?: Array<{
    id?: string;
    type?: string;
    name?: string;
    prefix?: string;
    nextSeq?: number;
    maxSeq?: number;
    expiresAt?: string | null;
    active?: boolean;
  }>;
  settings?: {
    name?: string;
    slogan?: string;
    taxId?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
};

export async function restoreBackup(fd: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const file = fd.get("backupFile") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Selecciona un archivo JSON de respaldo");
  }

  const text = await file.text();
  let data: BackupPayload;
  try {
    data = JSON.parse(text) as BackupPayload;
  } catch {
    throw new Error("El archivo no contiene un formato JSON válido");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Estructura de respaldo inválida");
  }

  let restoredCustomers = 0;
  let restoredProducts = 0;
  let restoredSuppliers = 0;
  let restoredNcf = 0;

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

  // Restaurar series NCF
  if (Array.isArray(data.ncfSeries)) {
    for (const s of data.ncfSeries) {
      if (!s.id || !s.type || !s.prefix) continue;
      await prisma.ncfSeries.upsert({
        where: { id: s.id },
        create: {
          id: s.id,
          type: s.type,
          name: s.name || s.type,
          prefix: s.prefix,
          nextSeq: Number(s.nextSeq) || 1,
          maxSeq: Number(s.maxSeq) || 99999999,
          expiresAt: s.expiresAt ? new Date(s.expiresAt) : null,
          active: s.active ?? true,
        },
        update: {
          name: s.name || s.type,
          prefix: s.prefix,
          nextSeq: Number(s.nextSeq) || 1,
          maxSeq: Number(s.maxSeq) || 99999999,
          expiresAt: s.expiresAt ? new Date(s.expiresAt) : null,
          active: s.active ?? true,
        },
      });
      restoredNcf++;
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
    summary: `Restauración: ${restoredProducts} productos, ${restoredCustomers} clientes, ${restoredSuppliers} proveedores, ${restoredNcf} series NCF`,
  });

  revalidatePath("/clientes");
  revalidatePath("/productos");
  revalidatePath("/proveedores");
  revalidatePath("/configuracion");
  revalidatePath("/panel");

  return {
    ok: true,
    message: `Restauración exitosa: ${restoredProducts} productos, ${restoredCustomers} clientes, ${restoredSuppliers} proveedores y ${restoredNcf} series NCF sincronizados.`,
  };
}
