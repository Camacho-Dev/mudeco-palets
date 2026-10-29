"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calcInvoiceTotals, parseDeliveryFromForm, parseTaxFromForm } from "@/lib/invoice-calc";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { deductStock, restoreInvoiceNetStock, assertStockAvailable } from "@/lib/stock";
import { writeAudit } from "@/lib/audit";
import { assertCreditAllows } from "@/lib/credit";
import { allocateNcf } from "@/lib/ncf";
import { canVoidInvoice } from "@/lib/rbac";
import { parseOptionalDate } from "@/lib/parse-date";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const lineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(1),
});

function parseLines(fd: FormData) {
  const descriptions = fd.getAll("description").map(String);
  const quantities = fd.getAll("quantity");
  const unitPrices = fd.getAll("unitPrice");
  const taxRates = fd.getAll("taxRate");
  const productIds = fd.getAll("productId").map(String);

  const lines = descriptions
    .map((description, i) => {
      if (!description.trim()) return null;
      return lineSchema.parse({
        description,
        quantity: quantities[i],
        unitPrice: unitPrices[i],
        taxRate: taxRates[i],
        productId: productIds[i] || undefined,
      });
    })
    .filter((l): l is z.infer<typeof lineSchema> => l !== null);

  if (lines.length === 0) throw new Error("Agrega al menos un mueble o servicio");
  return lines;
}

function revalidateSales(invoiceId?: string) {
  revalidatePath("/facturas");
  revalidatePath("/");
  revalidatePath("/panel");
  revalidatePath("/catalogo");
  revalidatePath("/vender");
  revalidatePath("/inventario");
  revalidatePath("/productos");
  revalidatePath("/pagos");
  revalidatePath("/finanzas");
  if (invoiceId) revalidatePath(`/facturas/${invoiceId}`);
}

async function resolveNcf(fd: FormData, issued: boolean) {
  const manual = String(fd.get("ncf") || "") || null;
  if (manual && !manual.startsWith("PENDING:")) return manual;
  const ncfType = String(fd.get("ncfType") || "") || null;
  if (issued && ncfType) return allocateNcf(ncfType);
  if (!issued && ncfType) return `PENDING:${ncfType}`;
  return null;
}

export async function createInvoice(fd: FormData) {
  const session = await requireSession();
  const customerId = String(fd.get("customerId") || "");
  if (!customerId) throw new Error("Cliente requerido");

  const notes = String(fd.get("notes") || "") || null;
  const dueDate = parseOptionalDate(String(fd.get("dueDate") || ""));
  const issue = String(fd.get("action") || "draft");
  const issued = issue === "issue" || issue === "print";

  const lines = parseLines(fd);
  const delivery = parseDeliveryFromForm(fd);
  const applyTax = parseTaxFromForm(fd);
  const totals = calcInvoiceTotals(lines, {
    deliveryFee: delivery.deliveryFee,
    applyTax,
  });
  if (issued) {
    await assertStockAvailable(lines);
    await assertCreditAllows(customerId, totals.total);
  }

  const ncf = await resolveNcf(fd, issued);
  const number = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      ncf,
      notes,
      status: issued ? "ISSUED" : "DRAFT",
      issueDate: new Date(),
      dueDate,
      delivery: delivery.delivery,
      deliveryFee: delivery.deliveryFee,
      applyTax,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId,
      userId: session.user.id,
      items: {
        create: lines.map((l) => ({
          productId: l.productId || null,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: Math.round(l.quantity * l.unitPrice * 100) / 100,
        })),
      },
    },
  });

  if (issued) {
    try {
      await deductStock(lines, { refType: "Invoice", refId: invoice.id });
    } catch (e) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
      await prisma.invoice.delete({ where: { id: invoice.id } });
      throw e;
    }
  }

  await writeAudit({
    action: issued ? "ISSUE" : "CREATE",
    entity: "Invoice",
    entityId: invoice.id,
    summary: issued
      ? `Factura emitida ${invoice.number} · total ${invoice.total}`
      : `Borrador creado ${invoice.number}`,
    details: { total: invoice.total, customerId, ncf },
  });

  revalidateSales(invoice.id);

  if (issue === "print") {
    redirect(`/facturas/${invoice.id}/imprimir`);
  }
  redirect(`/facturas/${invoice.id}`);
}

export async function generateAndPrint(fd: FormData): Promise<string> {
  const session = await requireSession();
  const customerId = String(fd.get("customerId") || "");
  if (!customerId) throw new Error("Cliente requerido");

  const lines = parseLines(fd);
  const delivery = parseDeliveryFromForm(fd);
  const applyTax = parseTaxFromForm(fd);
  const totals = calcInvoiceTotals(lines, {
    deliveryFee: delivery.deliveryFee,
    applyTax,
  });
  await assertStockAvailable(lines);
  await assertCreditAllows(customerId, totals.total);
  const ncf = await resolveNcf(fd, true);
  const number = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      ncf,
      status: "ISSUED",
      issueDate: new Date(),
      delivery: delivery.delivery,
      deliveryFee: delivery.deliveryFee,
      applyTax,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      customerId,
      userId: session.user.id,
      items: {
        create: lines.map((l) => ({
          productId: l.productId || null,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: Math.round(l.quantity * l.unitPrice * 100) / 100,
        })),
      },
    },
  });

  try {
    await deductStock(lines, { refType: "Invoice", refId: invoice.id });
  } catch (e) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    throw e;
  }
  revalidateSales(invoice.id);
  await writeAudit({
    action: "ISSUE",
    entity: "Invoice",
    entityId: invoice.id,
    summary: `Factura generada e impresa ${invoice.number} · total ${invoice.total}`,
    details: { total: invoice.total, customerId, lines: lines.length, ncf },
  });
  return invoice.id;
}

export async function updateInvoice(id: string, fd: FormData) {
  await requireSession();
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.status !== "DRAFT") {
    throw new Error("Solo se pueden editar borradores");
  }

  const customerId = String(fd.get("customerId") || "");
  const notes = String(fd.get("notes") || "") || null;
  const dueDate = parseOptionalDate(String(fd.get("dueDate") || ""));
  const issue = String(fd.get("action") || "draft");
  const issued = issue === "issue" || issue === "print";

  const lines = parseLines(fd);
  const delivery = parseDeliveryFromForm(fd);
  const applyTax = parseTaxFromForm(fd);
  const totals = calcInvoiceTotals(lines, {
    deliveryFee: delivery.deliveryFee,
    applyTax,
  });
  if (issued) {
    await assertStockAvailable(lines);
    await assertCreditAllows(customerId, totals.total);
  }
  const ncf = await resolveNcf(fd, issued);

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        customerId,
        ncf,
        notes,
        dueDate,
        delivery: delivery.delivery,
        deliveryFee: delivery.deliveryFee,
        applyTax,
        status: issued ? "ISSUED" : "DRAFT",
        issueDate: issued ? new Date() : existing.issueDate,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        items: {
          create: lines.map((l) => ({
            productId: l.productId || null,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            lineTotal: Math.round(l.quantity * l.unitPrice * 100) / 100,
          })),
        },
      },
    }),
  ]);

  if (issued) {
    try {
      await deductStock(lines, { refType: "Invoice", refId: id });
    } catch (e) {
      await prisma.invoice.update({
        where: { id },
        data: { status: "DRAFT", issueDate: existing.issueDate },
      });
      throw e;
    }
  }

  await writeAudit({
    action: issued ? "ISSUE" : "UPDATE",
    entity: "Invoice",
    entityId: id,
    summary: issued
      ? `Factura emitida ${existing.number}`
      : `Borrador actualizado ${existing.number}`,
  });

  revalidateSales(id);

  if (issue === "print") {
    redirect(`/facturas/${id}/imprimir`);
  }
  redirect(`/facturas/${id}`);
}

export async function issueInvoice(id: string) {
  await requireSession();
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!inv || inv.status !== "DRAFT") throw new Error("No se puede emitir");
  await assertStockAvailable(inv.items);
  await assertCreditAllows(inv.customerId, inv.total);

  let allocatedNcf = inv.ncf;
  if (inv.ncf?.startsWith("PENDING:")) {
    const pendingType = inv.ncf.slice("PENDING:".length);
    allocatedNcf = pendingType ? await allocateNcf(pendingType) : null;
  }

  await prisma.invoice.update({
    where: { id },
    data: { status: "ISSUED", issueDate: new Date(), ncf: allocatedNcf },
  });
  try {
    await deductStock(inv.items, { refType: "Invoice", refId: id });
  } catch (e) {
    await prisma.invoice.update({
      where: { id },
      data: { status: "DRAFT", issueDate: inv.issueDate, ncf: inv.ncf },
    });
    throw e;
  }
  await writeAudit({
    action: "ISSUE",
    entity: "Invoice",
    entityId: id,
    summary: `Factura emitida ${inv.number}`,
  });
  revalidateSales(id);
}

export async function voidInvoice(id: string) {
  const session = await requireSession();
  if (!canVoidInvoice(session.user.role)) {
    throw new Error("Solo el administrador puede anular facturas");
  }

  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
  if (!inv || inv.status === "VOIDED" || inv.status === "DRAFT") {
    throw new Error("No se puede anular");
  }
  if (["ISSUED", "PARTIAL", "PAID"].includes(inv.status)) {
    await restoreInvoiceNetStock(id, inv.items, { refType: "Invoice", refId: id });
  }

  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: { status: "VOIDED" },
    }),
    prisma.webOrder.updateMany({
      where: { invoiceId: id },
      data: { status: "CANCELLED" },
    }),
  ]);

  await writeAudit({
    action: "VOID",
    entity: "Invoice",
    entityId: id,
    summary: `Factura anulada ${inv.number} · total ${inv.total} · pagos revertidos ${paid}`,
    details: { total: inv.total, paymentsRemoved: paid },
  });
  revalidateSales(id);
  revalidatePath("/pedidos-web");
  revalidatePath("/mis-pedidos");
  redirect(`/facturas/${id}`);
}
