"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { canAdjustStock } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1),
  cost: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  stock: z.coerce.number(),
  minStock: z.coerce.number(),
});

function parse(fd: FormData) {
  return schema.parse({
    name: String(fd.get("name") || ""),
    sku: String(fd.get("sku") || "") || undefined,
    description: String(fd.get("description") || "") || undefined,
    category: String(fd.get("category") || "Madera"),
    cost: fd.get("cost") || 0,
    unit: String(fd.get("unit") || "UND"),
    stock: fd.get("stock") || 0,
    minStock: fd.get("minStock") || 5,
  });
}

function revalidateMaterials() {
  revalidatePath("/materiales");
  revalidatePath("/inventario");
  revalidatePath("/fabricacion");
  revalidatePath("/compras");
}

export async function createMaterial(fd: FormData) {
  await requireAdmin();
  const data = parse(fd);
  const material = await prisma.product.create({
    data: {
      kind: "MATERIAL",
      name: data.name,
      sku: data.sku,
      description: data.description,
      category: data.category,
      price: 0,
      cost: data.cost,
      taxRate: 0,
      unit: data.unit,
      stock: data.stock,
      minStock: data.minStock,
      active: true,
    },
  });

  if (material.stock !== 0) {
    await prisma.stockMovement.create({
      data: {
        productId: material.id,
        qty: material.stock,
        balance: material.stock,
        reason: "ADJUST",
        note: "Stock inicial almacén materiales",
      },
    });
  }

  await writeAudit({
    action: "CREATE",
    entity: "Material",
    entityId: material.id,
    summary: `Material en almacén: ${material.name} (${material.stock} ${material.unit})`,
  });
  revalidateMaterials();
  redirect("/materiales");
}

export async function updateMaterial(id: string, fd: FormData) {
  const session = await requireSession();
  await requireAdmin();
  const before = await prisma.product.findUnique({ where: { id } });
  if (!before || before.kind !== "MATERIAL") {
    throw new Error("Material no encontrado");
  }
  const data = parse(fd);
  const canStock = canAdjustStock(session.user.role);
  const nextStock = canStock ? data.stock : before.stock;

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      category: data.category,
      cost: data.cost,
      unit: data.unit,
      stock: nextStock,
      minStock: data.minStock,
      kind: "MATERIAL",
      price: 0,
      taxRate: 0,
    },
  });

  if (canStock && nextStock !== before.stock) {
    await prisma.stockMovement.create({
      data: {
        productId: id,
        qty: nextStock - before.stock,
        balance: nextStock,
        reason: "ADJUST",
        note: "Ajuste almacén materiales",
        userId: session.user.id,
      },
    });
  }

  await writeAudit({
    action: canStock && nextStock !== before.stock ? "STOCK" : "UPDATE",
    entity: "Material",
    entityId: id,
    summary:
      canStock && nextStock !== before.stock
        ? `Stock material ${data.name}: ${before.stock} → ${nextStock}`
        : `Material actualizado: ${data.name}`,
  });
  revalidateMaterials();
  redirect("/materiales");
}

export async function deactivateMaterial(id: string) {
  await requireAdmin();
  const m = await prisma.product.update({
    where: { id },
    data: { active: false },
  });
  await writeAudit({
    action: "DEACTIVATE",
    entity: "Material",
    entityId: id,
    summary: `Material desactivado: ${m.name}`,
  });
  revalidateMaterials();
  redirect("/materiales");
}
