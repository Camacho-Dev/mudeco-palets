"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { nextCreditNoteNumber } from "@/lib/invoice-number";
import { applyStockChange } from "@/lib/stock";
import {
  calcInvoiceTotals,
  paidAmount,
  creditNotesAmount,
  resolveInvoiceStatusWithCredits,
} from "@/lib/invoice-calc";
import { allocateNcf } from "@/lib/ncf";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCreditNote(fd: FormData) {
  const session = await requireAdmin();
  const invoiceId = String(fd.get("invoiceId") || "");
  const rawReason = String(fd.get("reason") || "").trim();
  if (!invoiceId || !rawReason) throw new Error("Factura y motivo requeridos");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true, creditNotes: true },
  });
  if (!invoice || invoice.status === "VOIDED" || invoice.status === "DRAFT") {
    throw new Error("Factura no válida para nota de crédito");
  }

  const alreadyCredited = creditNotesAmount(invoice.creditNotes);
  const remainingCreditable = Math.round((invoice.total - alreadyCredited) * 100) / 100;
  if (remainingCreditable <= 0.001) {
    throw new Error("Esta factura ya fue acreditada en su totalidad con notas de crédito previas.");
  }

  const useFull = fd.get("full") === "on" || fd.get("full") === "true";
  const customAmount = Number(fd.get("amount") || 0);

  let lines: {
    productId: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
  }[] = [];

  if (useFull) {
    if (alreadyCredited > 0.001) {
      throw new Error(
        `Esta factura ya tiene notas de crédito previas por ${alreadyCredited}. Ingrese un monto de ajuste parcial por el restante (máximo ${remainingCreditable}).`,
      );
    }
    lines = invoice.items.map((it) => ({
      productId: it.productId,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxRate: it.taxRate,
      lineTotal: it.lineTotal,
    }));
  } else if (customAmount > 0) {
    if (customAmount > remainingCreditable + 0.001) {
      throw new Error(
        `El monto (${customAmount}) supera el saldo acreditable restante de la factura (máximo ${remainingCreditable}).`,
      );
    }
    // Si la factura original lleva ITBIS, desglosar la base imponible y el 18% de ITBIS proporcionalmente
    const hasTax = invoice.applyTax && invoice.tax > 0;
    const baseAmount = hasTax
      ? Math.round((customAmount / 1.18) * 100) / 100
      : customAmount;
    lines = [
      {
        productId: null,
        description: `Ajuste parcial: ${rawReason}`,
        quantity: 1,
        unitPrice: baseAmount,
        taxRate: hasTax ? 0.18 : 0,
        lineTotal: baseAmount,
      },
    ];
  } else {
    throw new Error(
      "Indica un monto a acreditar o marca 'Devolver todas las líneas'",
    );
  }

  const totals = calcInvoiceTotals(lines, { applyTax: invoice.applyTax });
  // En monto parcial con ITBIS, asegurar que posibles diferencias de 1 centavo por redondeo cuadren con customAmount
  if (!useFull && customAmount > 0 && Math.abs(totals.total - customAmount) <= 0.02) {
    totals.total = Math.round(customAmount * 100) / 100;
    totals.tax = Math.round((totals.total - totals.subtotal) * 100) / 100;
  }

  const number = await nextCreditNoteNumber();
  const ncfB04 = await allocateNcf("B04").catch(() => null);
  const reason = ncfB04 ? `${rawReason} (NCF: ${ncfB04})` : rawReason;

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

  const [allPayments, allCreditNotes] = await Promise.all([
    prisma.payment.findMany({ where: { invoiceId } }),
    prisma.creditNote.findMany({ where: { invoiceId } }),
  ]);
  const paid = paidAmount(allPayments);
  const credited = creditNotesAmount(allCreditNotes);
  const updatedStatus = resolveInvoiceStatusWithCredits(
    invoice.total,
    paid,
    credited,
    invoice.status,
  );

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: updatedStatus },
  });

  await writeAudit({
    action: "CREDIT_NOTE",
    entity: "CreditNote",
    entityId: note.id,
    summary: `NC ${number}${ncfB04 ? ` (${ncfB04})` : ""} sobre ${invoice.number} · ${totals.total}`,
  });

  revalidatePath("/notas-credito");
  revalidatePath("/inventario");
  revalidatePath("/productos");
  revalidatePath("/vender");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/facturas");
  revalidatePath("/finanzas");
  revalidatePath("/panel");
  revalidatePath(`/facturas/${invoiceId}`);
  redirect("/notas-credito");
}
