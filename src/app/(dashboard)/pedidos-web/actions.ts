"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { calcInvoiceTotals } from "@/lib/invoice-calc";
import { restoreStock } from "@/lib/stock";

const ALLOWED = new Set([
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "QUOTED",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]);

export async function updateWebOrderStatus(id: string, fd: FormData) {
  const session = await requireSession();
  const status = String(fd.get("status") || "").trim();
  if (!ALLOWED.has(status)) throw new Error("Estado inválido");

  const order = await prisma.webOrder.update({
    where: { id },
    data: { status },
  });

  await writeAudit({
    action: "WEB_ORDER_STATUS",
    entity: "WebOrder",
    entityId: id,
    summary: `${order.number} → ${status}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/panel");
}

export async function addWebOrderStaffNote(id: string, fd: FormData) {
  const session = await requireSession();
  const note = String(fd.get("staffNote") || "").trim();
  if (!note) throw new Error("Escribe una nota");

  const order = await prisma.webOrder.findUnique({ where: { id } });
  if (!order) throw new Error("Pedido no encontrado");

  const stamp = new Date().toLocaleString("es-DO", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const who = session.user?.name || session.user?.email || "Staff";
  const block = `\n\n--- Nota interna (${stamp} · ${who}) ---\n${note}`;

  await prisma.webOrder.update({
    where: { id },
    data: { notes: `${order.notes || ""}${block}` },
  });

  if (order.quoteId) {
    const quote = await prisma.quote.findUnique({
      where: { id: order.quoteId },
    });
    if (quote) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { notes: `${quote.notes || ""}${block}` },
      });
      revalidatePath(`/cotizaciones/${order.quoteId}`);
    }
  }

  await writeAudit({
    action: "WEB_ORDER_NOTE",
    entity: "WebOrder",
    entityId: id,
    summary: `Nota en ${order.number}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
}

export async function cancelWebOrder(id: string) {
  const session = await requireSession();
  const existing = await prisma.webOrder.findUnique({
    where: { id },
    include: {
      invoice: {
        include: { items: true },
      },
    },
  });
  if (!existing) throw new Error("Pedido no encontrado");

  // Si tenía factura emitida/pagada y dedujo stock, anular la factura, eliminar pagos y devolver el inventario
  if (existing.invoice && ["ISSUED", "PARTIAL", "PAID"].includes(existing.invoice.status)) {
    await restoreStock(existing.invoice.items, {
      refType: "WebOrderCancel",
      refId: id,
    });
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { invoiceId: existing.invoice.id } }),
      prisma.invoice.update({
        where: { id: existing.invoice.id },
        data: { status: "VOIDED" },
      }),
    ]);
  }

  const order = await prisma.webOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await writeAudit({
    action: "WEB_ORDER_CANCEL",
    entity: "WebOrder",
    entityId: id,
    summary: `Cancelado ${order.number}${existing.invoice ? ` (factura ${existing.invoice.number} anulada y stock restituido)` : ""}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/panel");
  revalidatePath("/facturas");
  revalidatePath("/inventario");
  revalidatePath("/vender");
  revalidatePath("/");
  revalidatePath("/catalogo");
  if (existing.invoiceId) {
    revalidatePath(`/facturas/${existing.invoiceId}`);
  }
}

export async function markWebOrderDone(id: string) {
  await requireSession();
  await prisma.webOrder.update({
    where: { id },
    data: { status: "DONE" },
  });
  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/panel");
}

export async function markWebOrderInProgress(id: string) {
  await requireSession();
  await prisma.webOrder.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
  });
  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/panel");
}

/** Convierte la cotización del pedido web en factura borrador y enlaza */
export async function convertWebQuoteToInvoice(id: string) {
  const session = await requireSession();
  const order = await prisma.webOrder.findUnique({ where: { id } });
  if (!order?.quoteId) throw new Error("Este pedido no tiene cotización");

  const quote = await prisma.quote.findUnique({
    where: { id: order.quoteId },
    include: { items: true },
  });
  if (!quote || quote.status === "CONVERTED") {
    throw new Error("Cotización no convertible");
  }

  const number = await nextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      number,
      status: "DRAFT",
      source: "WEB",
      customerId: quote.customerId,
      userId: session.user.id,
      quoteId: quote.id,
      notes: quote.notes,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      items: {
        create: quote.items.map((l) => ({
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

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "CONVERTED" },
  });

  await prisma.webOrder.update({
    where: { id },
    data: { invoiceId: invoice.id, status: "DONE" },
  });

  await writeAudit({
    action: "CONVERT",
    entity: "Quote",
    entityId: quote.id,
    summary: `Web ${order.number}: ${quote.number} → ${invoice.number}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/cotizaciones");
  revalidatePath("/facturas");
  revalidatePath("/panel");
  redirect(`/facturas/${invoice.id}`);
}

/** Convierte directamente un pedido web (con o sin cotización previa) en una factura oficial del ERP */
export async function convertWebOrderDirectToInvoice(id: string) {
  const session = await requireSession();
  const order = await prisma.webOrder.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      invoice: true,
    },
  });
  if (!order) throw new Error("Pedido no encontrado");
  if (order.invoiceId) {
    redirect(`/facturas/${order.invoiceId}`);
  }

  // 1. Obtener o crear cliente
  let customerId = order.customerId;
  if (!customerId) {
    let customer = null;
    if (order.customerEmail) {
      customer = await prisma.customer.findFirst({
        where: { email: { equals: order.customerEmail, mode: "insensitive" } },
      });
    }
    if (!customer && order.customerTaxId) {
      customer = await prisma.customer.findFirst({
        where: { taxId: order.customerTaxId },
      });
    }
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          taxId: order.customerTaxId,
          address: order.customerAddress,
        },
      });
    }
    customerId = customer.id;
    await prisma.webOrder.update({
      where: { id },
      data: { customerId },
    });
  }

  // 2. Líneas de factura con cálculo estándar de ITBIS (18% sobre subtotal neto)
  const number = await nextInvoiceNumber();
  let itemsData: {
    productId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
  }[] = [];

  if (order.items && order.items.length > 0) {
    itemsData = order.items.map((i) => {
      const rate = i.taxRate ?? 0.18;
      const lineTotal = Math.round(i.quantity * i.unitPrice * 100) / 100;
      return {
        productId: i.productId,
        description: i.description || i.product?.name || "Artículo de catálogo web",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: rate,
        lineTotal,
      };
    });
  } else {
    const base = order.subtotal > 0 ? order.subtotal : order.total > 0 ? +(order.total / 1.18).toFixed(2) : 0;
    itemsData = [
      {
        productId: null,
        description: `Servicio / Pedido web ${order.number}${order.serviceKind ? ` (${order.serviceKind})` : ""}`,
        quantity: 1,
        unitPrice: base,
        taxRate: 0.18,
        lineTotal: base,
      },
    ];
  }

  const totals = calcInvoiceTotals(itemsData, { applyTax: true });

  const invoice = await prisma.invoice.create({
    data: {
      number,
      status: "DRAFT",
      source: "WEB",
      customerId,
      userId: session.user.id,
      notes: `Generada desde pedido web ${order.number} (${order.customerEmail}).\n${order.notes || ""}`,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      items: {
        create: itemsData,
      },
    },
  });

  await prisma.webOrder.update({
    where: { id },
    data: {
      invoiceId: invoice.id,
      status: order.status === "PENDING" ? "IN_PROGRESS" : order.status,
    },
  });

  await writeAudit({
    action: "GENERATE_INVOICE",
    entity: "WebOrder",
    entityId: id,
    summary: `Factura ${invoice.number} generada desde pedido web ${order.number}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/facturas");
  revalidatePath("/panel");
  redirect(`/facturas/${invoice.id}`);
}
