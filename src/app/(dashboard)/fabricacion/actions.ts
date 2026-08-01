"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { nextWorkOrderNumber } from "@/lib/invoice-number";
import { applyStockChange } from "@/lib/stock";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkOrder(fd: FormData) {
  const session = await requireAdmin();
  const productId = String(fd.get("productId") || "");
  const quantity = Number(fd.get("quantity") || 1);
  const notes = String(fd.get("notes") || "") || null;
  if (!productId || !(quantity > 0)) throw new Error("Datos inválidos");

  const materialIds = fd.getAll("materialId").map(String);
  const materialQtys = fd.getAll("materialQty");
  const items: { productId: string; quantity: number }[] = [];
  for (let i = 0; i < materialIds.length; i++) {
    if (!materialIds[i]) continue;
    const q = Number(materialQtys[i]);
    if (!(q > 0)) continue;
    items.push({ productId: materialIds[i], quantity: q * quantity });
  }
  if (!items.length) throw new Error("Agrega materiales");

  const number = await nextWorkOrderNumber();
  const wo = await prisma.workOrder.create({
    data: {
      number,
      productId,
      quantity,
      notes,
      userId: session.user.id,
      status: "PENDING",
      items: { create: items },
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "WorkOrder",
    entityId: wo.id,
    summary: `Orden de fabricación ${number}`,
  });
  revalidatePath("/fabricacion");
  redirect("/fabricacion");
}

export async function completeWorkOrder(id: string) {
  await requireAdmin();
  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: { items: true, product: true },
  });
  if (!wo || wo.status === "DONE") throw new Error("No se puede completar");

  for (const item of wo.items) {
    await applyStockChange({
      productId: item.productId,
      qtyDelta: -item.quantity,
      reason: "MANUFACTURE_OUT",
      refType: "WorkOrder",
      refId: id,
      note: wo.number,
    });
  }

  await applyStockChange({
    productId: wo.productId,
    qtyDelta: wo.quantity,
    reason: "MANUFACTURE_IN",
    refType: "WorkOrder",
    refId: id,
    note: wo.number,
    allowNegative: true,
  });

  await prisma.workOrder.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });

  await writeAudit({
    action: "COMPLETE",
    entity: "WorkOrder",
    entityId: id,
    summary: `Fabricación completada ${wo.number} → +${wo.quantity} ${wo.product.name}`,
  });
  revalidatePath("/fabricacion");
  revalidatePath("/inventario");
  redirect("/fabricacion");
}
