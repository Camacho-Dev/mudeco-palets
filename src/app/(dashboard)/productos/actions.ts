"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { canDeactivateProduct, canAdjustStock } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(1),
  unit: z.string().min(1),
  stock: z.coerce.number(),
  minStock: z.coerce.number(),
  active: z.boolean().optional(),
  imageUrl: z.string().optional(),
  widthCm: z.coerce.number().optional(),
  heightCm: z.coerce.number().optional(),
  depthCm: z.coerce.number().optional(),
});

function formDataToProduct(fd: FormData) {
  const width = String(fd.get("widthCm") || "");
  const height = String(fd.get("heightCm") || "");
  const depth = String(fd.get("depthCm") || "");
  return productSchema.parse({
    name: String(fd.get("name") || ""),
    sku: String(fd.get("sku") || "") || undefined,
    description: String(fd.get("description") || "") || undefined,
    category: String(fd.get("category") || "Muebles"),
    price: fd.get("price"),
    cost: fd.get("cost") || 0,
    taxRate: fd.get("taxRate"),
    unit: String(fd.get("unit") || "UND"),
    stock: fd.get("stock") || 0,
    minStock: fd.get("minStock") || 2,
    active: fd.get("active") === "on" || fd.get("active") === "true",
    imageUrl: String(fd.get("imageUrl") || "") || undefined,
    widthCm: width ? Number(width) : undefined,
    heightCm: height ? Number(height) : undefined,
    depthCm: depth ? Number(depth) : undefined,
  });
}

function revalidateProducts(productId?: string) {
  revalidatePath("/productos");
  revalidatePath("/inventario");
  revalidatePath("/vender");
  revalidatePath("/");
  revalidatePath("/catalogo");
  if (productId) revalidatePath(`/producto/${productId}`);
}

export async function createProduct(fd: FormData) {
  await requireSession();
  const data = formDataToProduct(fd);
  const product = await prisma.product.create({
    data: {
      kind: "FINISHED",
      name: data.name,
      sku: data.sku,
      description: data.description,
      category: data.category,
      price: data.price,
      cost: data.cost,
      taxRate: data.taxRate,
      unit: data.unit,
      stock: data.stock,
      minStock: data.minStock,
      active: data.active ?? true,
      imageUrl: data.imageUrl || null,
      widthCm: data.widthCm ?? null,
      heightCm: data.heightCm ?? null,
      depthCm: data.depthCm ?? null,
    },
  });
  if (product.stock !== 0 && product.sku !== "CUS-001") {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        qty: product.stock,
        balance: product.stock,
        reason: "ADJUST",
        note: "Stock inicial",
      },
    });
  }
  await writeAudit({
    action: "CREATE",
    entity: "Product",
    entityId: product.id,
    summary: `Mueble creado: ${product.name} (stock ${product.stock})`,
    details: { price: product.price, stock: product.stock, sku: product.sku },
  });
  revalidateProducts(product.id);
  redirect("/productos");
}

export async function updateProduct(id: string, fd: FormData) {
  const session = await requireSession();
  const before = await prisma.product.findUnique({ where: { id } });
  if (!before) throw new Error("Producto no encontrado");
  const data = formDataToProduct(fd);

  const wantsStockChange = before.stock !== data.stock;
  const canStock = canAdjustStock(session.user.role);
  const nextStock = wantsStockChange && canStock ? data.stock : before.stock;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      category: data.category,
      price: data.price,
      cost: data.cost,
      taxRate: data.taxRate,
      unit: data.unit,
      stock: nextStock,
      minStock: data.minStock,
      active: data.active ?? true,
      imageUrl: data.imageUrl || null,
      widthCm: data.widthCm ?? null,
      heightCm: data.heightCm ?? null,
      depthCm: data.depthCm ?? null,
    },
  });

  if (wantsStockChange && canStock && before.sku !== "CUS-001") {
    await prisma.stockMovement.create({
      data: {
        productId: id,
        qty: nextStock - before.stock,
        balance: nextStock,
        reason: "ADJUST",
        note: "Ajuste manual de catálogo",
        userId: session.user.id,
      },
    });
  }

  await writeAudit({
    action: wantsStockChange && canStock ? "STOCK" : "UPDATE",
    entity: "Product",
    entityId: id,
    summary:
      wantsStockChange && canStock
        ? `Stock de ${product.name}: ${before.stock} → ${nextStock}`
        : `Mueble actualizado: ${product.name}`,
    details: {
      beforeStock: before.stock,
      afterStock: nextStock,
      price: product.price,
    },
  });

  revalidateProducts(id);
  redirect("/productos");
}

export async function deleteProduct(id: string) {
  const session = await requireSession();
  if (!canDeactivateProduct(session.user.role)) {
    throw new Error("Solo el administrador puede desactivar productos");
  }
  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  });
  await writeAudit({
    action: "DEACTIVATE",
    entity: "Product",
    entityId: id,
    summary: `Mueble desactivado/eliminado del catálogo: ${product.name}`,
    details: { stock: product.stock },
  });
  revalidateProducts(id);
  redirect("/productos");
}
