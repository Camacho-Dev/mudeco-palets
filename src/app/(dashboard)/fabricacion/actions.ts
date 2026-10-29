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
  if (!wo || wo.status !== "PENDING") {
    throw new Error("Solo se pueden completar órdenes de fabricación pendientes");
  }

  // 1. Agrupar cantidades por material para verificar disponibilidad real incluso si un material se repite
  const neededByMaterial = new Map<string, number>();
  for (const item of wo.items) {
    neededByMaterial.set(
      item.productId,
      (neededByMaterial.get(item.productId) || 0) + item.quantity,
    );
  }

  let totalMaterialCost = 0;
  for (const [matId, totalRequired] of neededByMaterial.entries()) {
    const mat = await prisma.product.findUnique({
      where: { id: matId },
    });
    if (!mat) {
      throw new Error("Hay un material en la orden que ya no existe");
    }
    if (mat.stock + 0.0001 < totalRequired) {
      throw new Error(
        `Stock insuficiente de "${mat.name}": se requieren ${totalRequired} ${mat.unit}, disponibles: ${mat.stock}`,
      );
    }
    totalMaterialCost += (mat.cost || 0) * totalRequired;
  }

  // 2. Descontar materiales con mecanismo de rollback si ocurre un error inesperado
  const deducted: { productId: string; qty: number }[] = [];
  try {
    for (const item of wo.items) {
      await applyStockChange({
        productId: item.productId,
        qtyDelta: -item.quantity,
        reason: "MANUFACTURE_OUT",
        refType: "WorkOrder",
        refId: id,
        note: wo.number,
      });
      deducted.push({ productId: item.productId, qty: item.quantity });
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

    // Si el mueble terminado tenía costo 0 y los materiales tenían costo, actualizar su costo unitario de fabricación
    if (wo.product.cost <= 0 && totalMaterialCost > 0 && wo.quantity > 0) {
      const unitManufacturedCost =
        Math.round((totalMaterialCost / wo.quantity) * 100) / 100;
      await prisma.product.update({
        where: { id: wo.productId },
        data: { cost: unitManufacturedCost },
      });
    }

    await prisma.workOrder.update({
      where: { id },
      data: { status: "DONE", completedAt: new Date() },
    });
  } catch (err) {
    for (const d of deducted) {
      await applyStockChange({
        productId: d.productId,
        qtyDelta: d.qty,
        reason: "ADJUST",
        refType: "WorkOrder",
        refId: id,
        note: `Reversión por error en orden ${wo.number}`,
        allowNegative: true,
      }).catch(() => undefined);
    }
    throw err;
  }

  await writeAudit({
    action: "COMPLETE",
    entity: "WorkOrder",
    entityId: id,
    summary: `Fabricación completada ${wo.number} → +${wo.quantity} ${wo.product.name}`,
  });
  revalidatePath("/fabricacion");
  revalidatePath("/inventario");
  revalidatePath("/materiales");
  revalidatePath("/productos");
  revalidatePath("/vender");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath(`/producto/${wo.productId}`);
  redirect("/fabricacion");
}

export async function cancelWorkOrder(id: string) {
  await requireAdmin();
  const wo = await prisma.workOrder.findUnique({
    where: { id },
  });
  if (!wo || wo.status !== "PENDING") {
    throw new Error("Solo se pueden cancelar órdenes en estado pendiente");
  }

  await prisma.workOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await writeAudit({
    action: "CANCEL",
    entity: "WorkOrder",
    entityId: id,
    summary: `Orden de fabricación cancelada ${wo.number}`,
  });

  revalidatePath("/fabricacion");
}
