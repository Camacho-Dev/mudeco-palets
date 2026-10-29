"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { nextPurchaseNumber } from "@/lib/invoice-number";
import { applyStockChange } from "@/lib/stock";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPurchase(fd: FormData) {
  await requireAdmin();
  const supplierId = String(fd.get("supplierId") || "");
  if (!supplierId) throw new Error("Proveedor requerido");
  const notes = String(fd.get("notes") || "") || null;
  const productIds = fd.getAll("productId").map(String);
  const quantities = fd.getAll("quantity");
  const costs = fd.getAll("unitCost");

  const items: { productId: string; quantity: number; unitCost: number; lineTotal: number }[] = [];
  for (let i = 0; i < productIds.length; i++) {
    if (!productIds[i]) continue;
    const quantity = Number(quantities[i]);
    const unitCost = Number(costs[i]);
    if (!(quantity > 0)) continue;
    items.push({
      productId: productIds[i],
      quantity,
      unitCost,
      lineTotal: Math.round(quantity * unitCost * 100) / 100,
    });
  }
  if (!items.length) throw new Error("Agrega ítems");

  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  const number = await nextPurchaseNumber();
  const purchase = await prisma.purchase.create({
    data: {
      number,
      supplierId,
      notes,
      total,
      status: "ORDERED",
      items: { create: items },
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "Purchase",
    entityId: purchase.id,
    summary: `Orden de compra ${purchase.number}`,
  });
  revalidatePath("/compras");
  redirect(`/compras/${purchase.id}`);
}

export async function receivePurchase(id: string) {
  await requireAdmin();
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!purchase || !["ORDERED", "DRAFT"].includes(purchase.status)) {
    throw new Error("Solo se pueden recibir compras en estado Ordenada o Borrador");
  }

  for (const item of purchase.items) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, cost: true },
    });

    await applyStockChange({
      productId: item.productId,
      qtyDelta: item.quantity,
      reason: "PURCHASE",
      refType: "Purchase",
      refId: id,
      note: purchase.number,
      allowNegative: true,
    });

    // Calcular costo promedio ponderado si ya había stock positivo y costo previo
    let nextCost = item.unitCost;
    if (
      existingProduct &&
      existingProduct.stock > 0 &&
      existingProduct.cost > 0 &&
      item.unitCost > 0
    ) {
      const totalValue =
        existingProduct.stock * existingProduct.cost +
        item.quantity * item.unitCost;
      const totalQty = existingProduct.stock + item.quantity;
      nextCost = Math.round((totalValue / totalQty) * 100) / 100;
    }

    await prisma.product.update({
      where: { id: item.productId },
      data: { cost: nextCost },
    });
  }

  await prisma.purchase.update({
    where: { id },
    data: { status: "RECEIVED", receivedAt: new Date() },
  });

  await writeAudit({
    action: "RECEIVE",
    entity: "Purchase",
    entityId: id,
    summary: `Compra recibida ${purchase.number} · stock y costo actualizados`,
  });
  revalidatePath("/compras");
  revalidatePath("/inventario");
  revalidatePath("/materiales");
  revalidatePath("/productos");
  revalidatePath("/vender");
  revalidatePath("/finanzas");
  redirect(`/compras/${id}`);
}

export async function cancelPurchase(id: string) {
  await requireAdmin();
  const purchase = await prisma.purchase.findUnique({
    where: { id },
  });
  if (!purchase || purchase.status === "RECEIVED") {
    throw new Error("No se puede cancelar una compra ya recibida");
  }

  await prisma.purchase.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await writeAudit({
    action: "CANCEL",
    entity: "Purchase",
    entityId: id,
    summary: `Compra cancelada ${purchase.number}`,
  });

  revalidatePath("/compras");
  redirect(`/compras/${id}`);
}
