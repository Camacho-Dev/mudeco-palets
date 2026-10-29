"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  calcInvoiceBalance,
  creditNotesAmount,
  paidAmount,
  resolveInvoiceStatusWithCredits,
} from "@/lib/invoice-calc";
import { writeAudit } from "@/lib/audit";
import { canDeletePayment } from "@/lib/rbac";
import { notifyCustomerWebOrderStatus, sendInvoiceEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "TRANSFER", "CARD", "CHECK", "OTHER"]),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

function revalidatePay(invoiceId: string) {
  revalidatePath(`/facturas/${invoiceId}`);
  revalidatePath("/facturas");
  revalidatePath("/pagos");
  revalidatePath("/pedidos-web");
  revalidatePath("/mis-pedidos");
  revalidatePath("/");
  revalidatePath("/panel");
  revalidatePath("/finanzas");
}

export async function createPayment(invoiceId: string, fd: FormData) {
  await requireSession();

  const data = paymentSchema.parse({
    amount: fd.get("amount"),
    method: fd.get("method") || "CASH",
    paidAt: String(fd.get("paidAt") || "") || undefined,
    notes: String(fd.get("notes") || "") || undefined,
  });

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true, creditNotes: true },
  });
  if (!invoice) throw new Error("Factura no encontrada");
  if (!["ISSUED", "PARTIAL"].includes(invoice.status)) {
    throw new Error("La factura no admite pagos");
  }

  const balance = calcInvoiceBalance(
    invoice.total,
    invoice.payments,
    invoice.creditNotes,
  );
  if (data.amount > balance + 0.001) {
    throw new Error("El monto supera el saldo pendiente");
  }

  await prisma.payment.create({
    data: {
      invoiceId,
      amount: data.amount,
      method: data.method,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      notes: data.notes,
    },
  });

  const [payments, creditNotes] = await Promise.all([
    prisma.payment.findMany({ where: { invoiceId } }),
    prisma.creditNote.findMany({ where: { invoiceId } }),
  ]);
  const paid = paidAmount(payments);
  const credited = creditNotesAmount(creditNotes);
  const status = resolveInvoiceStatusWithCredits(
    invoice.total,
    paid,
    credited,
    invoice.status,
  );

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });

  // Si la factura quedó saldada, actualizar automáticamente cualquier Pedido Web vinculado y notificar al cliente
  if (status === "PAID") {
    const linkedOrders = await prisma.webOrder.findMany({
      where: {
        invoiceId,
        status: { in: ["PENDING", "AWAITING_PAYMENT"] },
      },
      select: { id: true },
    });
    if (linkedOrders.length > 0) {
      await prisma.webOrder.updateMany({
        where: {
          id: { in: linkedOrders.map((o) => o.id) },
        },
        data: { status: "PAID" },
      });
      for (const wo of linkedOrders) {
        void notifyCustomerWebOrderStatus(wo.id, "PAID");
        revalidatePath(`/pedido/${wo.id}`);
      }
      void sendInvoiceEmail(invoiceId).catch(() => undefined);
    }
  }

  await writeAudit({
    action: "PAYMENT",
    entity: "Payment",
    entityId: invoiceId,
    summary: `Pago de ${data.amount} en factura ${invoice.number} (${data.method})`,
    details: { amount: data.amount, method: data.method, status },
  });

  revalidatePay(invoiceId);
  redirect(`/facturas/${invoiceId}`);
}

export async function deletePayment(paymentId: string) {
  const session = await requireSession();
  if (!canDeletePayment(session.user.role)) {
    throw new Error("Solo el administrador puede eliminar pagos");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: { include: { payments: true, creditNotes: true } } },
  });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.invoice.status === "VOIDED") {
    throw new Error("No se puede modificar una factura anulada");
  }

  await prisma.payment.delete({ where: { id: paymentId } });

  const [payments, creditNotes] = await Promise.all([
    prisma.payment.findMany({ where: { invoiceId: payment.invoiceId } }),
    prisma.creditNote.findMany({ where: { invoiceId: payment.invoiceId } }),
  ]);
  const paid = paidAmount(payments);
  const credited = creditNotesAmount(creditNotes);
  const status = resolveInvoiceStatusWithCredits(
    payment.invoice.total,
    paid,
    credited,
    payment.invoice.status,
  );
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { status },
  });

  // Si la factura dejó de estar pagada, revertir el estado del Pedido Web si estaba en PAID
  if (status !== "PAID") {
    await prisma.webOrder.updateMany({
      where: {
        invoiceId: payment.invoiceId,
        status: "PAID",
      },
      data: { status: "PENDING" },
    });
  }

  await writeAudit({
    action: "DELETE",
    entity: "Payment",
    entityId: paymentId,
    summary: `Pago eliminado de ${payment.amount} en factura ${payment.invoice.number}`,
  });

  revalidatePay(payment.invoiceId);
  redirect(`/facturas/${payment.invoiceId}`);
}
