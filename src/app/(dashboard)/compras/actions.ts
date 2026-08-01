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
  if (!purchase || purchase.status === "RECEIVED") {
    throw new Error("No se puede recibir");
  }

  for (const item of purchase.items) {
    await applyStockChange({
      productId: item.productId,
      qtyDelta: item.quantity,
      reason: "PURCHASE",
      refType: "Purchase",
      refId: id,
      note: purchase.number,
      allowNegative: true,
    });
    await prisma.product.update({
      where: { id: item.productId },
      data: { cost: item.unitCost },
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
    summary: `Compra recibida ${purchase.number} · stock actualizado`,
  });
  revalidatePath("/compras");
  revalidatePath("/inventario");
  redirect(`/compras/${id}`);
}
