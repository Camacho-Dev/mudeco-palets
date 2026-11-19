"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { canAdjustStock } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { invalidateScoredProductsCache } from "@/lib/recommendations";

const adjustSchema = z.object({
  productId: z.string().min(1),
  adjustmentType: z.enum(["ADD", "REMOVE", "SET"]),
  quantity: z.coerce.number().min(0),
  reason: z.string().min(1),
  note: z.string().optional(),
});

export async function quickStockAdjust(fd: FormData) {
  const session = await requireSession();
  if (!canAdjustStock(session.user.role)) {
    throw new Error("No tienes permisos para realizar ajustes manuales de stock");
  }

  const parsed = adjustSchema.parse({
    productId: String(fd.get("productId") || ""),
    adjustmentType: String(fd.get("adjustmentType") || "ADD"),
    quantity: fd.get("quantity"),
    reason: String(fd.get("reason") || "ADJUST"),
    note: String(fd.get("note") || "") || undefined,
  });

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: parsed.productId },
    });

    if (!product) {
      throw new Error("El mueble o material no existe");
    }

    const currentStock = product.stock;
    let computedNext = currentStock;
    let delta = 0;

    if (parsed.adjustmentType === "ADD") {
      computedNext = currentStock + parsed.quantity;
      delta = parsed.quantity;
    } else if (parsed.adjustmentType === "REMOVE") {
      computedNext = Math.max(0, currentStock - parsed.quantity);
      delta = -Math.min(currentStock, parsed.quantity);
    } else if (parsed.adjustmentType === "SET") {
      computedNext = parsed.quantity;
      delta = computedNext - currentStock;
    }

    if (delta === 0 && parsed.adjustmentType !== "SET") {
      return { nextStock: currentStock, moveQty: 0, productName: product.name };
    }

    await tx.product.update({
      where: { id: product.id },
      data: { stock: computedNext },
    });

    await tx.stockMovement.create({
      data: {
        productId: product.id,
        qty: delta,
        balance: computedNext,
        reason: parsed.reason,
        note: parsed.note || `Ajuste rápido desde inventario (${parsed.adjustmentType})`,
        userId: session.user.id,
      },
    });

    return {
      productId: product.id,
      productName: product.name,
      currentStock,
      nextStock: computedNext,
      moveQty: delta,
    };
  });

  const { productId, productName, currentStock, nextStock, moveQty } = result;
  void productId;

  if (moveQty === 0 && parsed.adjustmentType !== "SET") {
    return { ok: true, message: "Sin cambios en el stock" };
  }

  await writeAudit({
    action: "STOCK",
    entity: "Product",
    entityId: productId,
    summary: `Ajuste rápido en inventario (${productName}): ${currentStock} → ${nextStock} (${moveQty >= 0 ? "+" : ""}${moveQty})`,
    details: {
      productId,
      productName,
      previousStock: currentStock,
      newStock: nextStock,
      diff: moveQty,
      reason: parsed.reason,
      note: parsed.note,
    },
  });

  invalidateScoredProductsCache();
  revalidatePath("/inventario");
  revalidatePath("/productos");
  revalidatePath("/vender");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${productId}`);

  return { ok: true, stock: nextStock };
}
