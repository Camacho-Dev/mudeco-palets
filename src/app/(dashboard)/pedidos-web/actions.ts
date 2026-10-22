"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { nextInvoiceNumber } from "@/lib/invoice-number";

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
  const order = await prisma.webOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await writeAudit({
    action: "WEB_ORDER_CANCEL",
    entity: "WebOrder",
    entityId: id,
    summary: `Cancelado ${order.number}`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath(`/pedidos-web/${id}`);
  revalidatePath("/panel");
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
