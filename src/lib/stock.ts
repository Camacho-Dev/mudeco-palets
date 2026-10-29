import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { invalidateScoredProductsCache } from "@/lib/recommendations";

export type StockReason =
  | "SALE"
  | "VOID"
  | "PURCHASE"
  | "ADJUST"
  | "MANUFACTURE_IN"
  | "MANUFACTURE_OUT"
  | "CREDIT_NOTE";

function skipsStock(sku: string | null | undefined) {
  return sku === "CUS-001";
}

async function currentUserId() {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Verifica stock antes de emitir. Agrupa cantidades por producto. */
export async function assertStockAvailable(
  lines: { productId?: string | null; quantity: number }[],
) {
  const needed = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId) continue;
    needed.set(
      line.productId,
      (needed.get(line.productId) || 0) + line.quantity,
    );
  }

  for (const [productId, qty] of needed) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Hay un producto que ya no existe en el catálogo");
    }
    if (skipsStock(product.sku)) continue;
    if (product.stock <= 0) {
      throw new Error(
        `No hay stock de “${product.name}”. No se puede guardar la factura.`,
      );
    }
    if (product.stock + 0.0001 < qty) {
      throw new Error(
        `Stock insuficiente de “${product.name}”: pediste ${qty}, hay ${product.stock}.`,
      );
    }
  }
}

export async function applyStockChange(input: {
  productId: string;
  qtyDelta: number;
  reason: StockReason;
  refType?: string;
  refId?: string;
  note?: string;
  allowNegative?: boolean;
}) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!product) throw new Error("Producto no encontrado");
  if (skipsStock(product.sku)) return product.stock;

  // Verificar stock antes si no se permite negativo
  if (!input.allowNegative && input.qtyDelta < 0) {
    const needed = Math.abs(input.qtyDelta);
    if (product.stock + 0.0001 < needed) {
      throw new Error(
        `Stock insuficiente: ${product.name} (disponible ${product.stock})`,
      );
    }
  }

  const userId = await currentUserId();

  // Usar increment atómico para evitar race conditions
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.product.update({
      where: { id: input.productId },
      data: { stock: { increment: input.qtyDelta } },
    });

    // Evitar sobreventa en concurrencia: si quedó negativo y no se permite, abortar transacción
    if (!input.allowNegative && result.stock < 0) {
      throw new Error(
        `Stock insuficiente durante la operación: ${product.name}`,
      );
    }

    const balance = result.stock;

    await tx.stockMovement.create({
      data: {
        productId: input.productId,
        qty: input.qtyDelta,
        balance,
        reason: input.reason,
        refType: input.refType,
        refId: input.refId,
        note: input.note,
        userId,
      },
    });

    return balance;
  });

  invalidateScoredProductsCache();
  return updated;
}

export async function deductStock(
  lines: { productId?: string | null; quantity: number }[],
  ref?: { refType: string; refId: string },
  options?: { allowBackorder?: boolean },
) {
  if (!options?.allowBackorder) {
    await assertStockAvailable(lines);
  }
  for (const line of lines) {
    if (!line.productId) continue;
    let qtyToDeduct = line.quantity;
    if (options?.allowBackorder) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product) {
        throw new Error("Hay un producto que ya no existe en el catálogo");
      }
      if (skipsStock(product.sku)) continue;
      qtyToDeduct = Math.max(0, Math.min(product.stock, line.quantity));
      if (qtyToDeduct <= 0) continue;
    }
    await applyStockChange({
      productId: line.productId,
      qtyDelta: -qtyToDeduct,
      reason: "SALE",
      refType: ref?.refType,
      refId: ref?.refId,
    });
  }
}

export async function restoreStock(
  lines: { productId?: string | null; quantity: number }[],
  ref?: { refType: string; refId: string },
) {
  for (const line of lines) {
    if (!line.productId || line.quantity <= 0) continue;
    await applyStockChange({
      productId: line.productId,
      qtyDelta: line.quantity,
      reason: "VOID",
      refType: ref?.refType,
      refId: ref?.refId,
      allowNegative: true,
    });
  }
}

/**
 * Restituye al inventario únicamente las unidades que fueron efectivamente
 * descontadas en una factura menos las que ya hayan sido devueltas por Notas de Crédito.
 */
export async function restoreInvoiceNetStock(
  invoiceId: string,
  fallbackItems: { productId?: string | null; quantity: number }[],
  ref?: { refType: string; refId: string },
) {
  const [saleMovements, creditNotes] = await Promise.all([
    prisma.stockMovement.findMany({
      where: {
        refType: "Invoice",
        refId: invoiceId,
        reason: "SALE",
      },
    }),
    prisma.creditNote.findMany({
      where: { invoiceId },
      include: { items: true },
    }),
  ]);

  const creditedByProduct = new Map<string, number>();
  for (const cn of creditNotes) {
    for (const item of cn.items) {
      if (!item.productId) continue;
      creditedByProduct.set(
        item.productId,
        (creditedByProduct.get(item.productId) || 0) + item.quantity,
      );
    }
  }

  const deductedByProduct = new Map<string, number>();
  if (saleMovements.length > 0) {
    for (const mov of saleMovements) {
      deductedByProduct.set(
        mov.productId,
        (deductedByProduct.get(mov.productId) || 0) + Math.abs(mov.qty),
      );
    }
  } else {
    for (const item of fallbackItems) {
      if (!item.productId) continue;
      deductedByProduct.set(
        item.productId,
        (deductedByProduct.get(item.productId) || 0) + item.quantity,
      );
    }
  }

  const netLines: { productId: string; quantity: number }[] = [];
  for (const [productId, deductedQty] of deductedByProduct.entries()) {
    const alreadyCredited = creditedByProduct.get(productId) || 0;
    const netToRestore = Math.max(0, deductedQty - alreadyCredited);
    if (netToRestore > 0) {
      netLines.push({ productId, quantity: netToRestore });
    }
  }

  await restoreStock(netLines, ref ?? { refType: "Invoice", refId: invoiceId });
}
