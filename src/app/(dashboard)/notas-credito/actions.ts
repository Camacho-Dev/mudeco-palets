"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { nextCreditNoteNumber } from "@/lib/invoice-number";
import { applyStockChange } from "@/lib/stock";
import { calcInvoiceTotals } from "@/lib/invoice-calc";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCreditNote(fd: FormData) {
  const session = await requireAdmin();
  const invoiceId = String(fd.get("invoiceId") || "");
  const reason = String(fd.get("reason") || "").trim();
  if (!invoiceId || !reason) throw new Error("Factura y motivo requeridos");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });
  if (!invoice || invoice.status === "VOIDED" || invoice.status === "DRAFT") {
    throw new Error("Factura no válida para nota de crédito");
  }

  const useFull = fd.get("full") === "on" || fd.get("full") === "true";
  const lines = useFull
    ? invoice.items.map((it) => ({
        productId: it.productId,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate,
        lineTotal: it.lineTotal,
      }))
    : [];

  if (!lines.length) throw new Error("Marca 'devolver todo' por ahora");

  const totals = calcInvoiceTotals(lines);
  const number = await nextCreditNoteNumber();

  const note = await prisma.creditNote.create({
    data: {
      number,
      reason,
      invoiceId,
      customerId: invoice.customerId,
      userId: session.user.id,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  for (const line of lines) {
    if (!line.productId) continue;
    await applyStockChange({
      productId: line.productId,
      qtyDelta: line.quantity,
      reason: "CREDIT_NOTE",
      refType: "CreditNote",
      refId: note.id,
      note: number,
      allowNegative: true,
    });
  }

  await writeAudit({
    action: "CREDIT_NOTE",
    entity: "CreditNote",
    entityId: note.id,
    summary: `NC ${number} sobre ${invoice.number} · ${totals.total}`,
  });

  revalidatePath("/notas-credito");
  revalidatePath("/inventario");
  revalidatePath(`/facturas/${invoiceId}`);
  redirect("/notas-credito");
}
