"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { paidAmount, resolvePaymentStatus } from "@/lib/invoice-calc";
import { writeAudit } from "@/lib/audit";
import { canDeletePayment } from "@/lib/rbac";
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
  revalidatePath("/");
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
    include: { payments: true },
  });
  if (!invoice) throw new Error("Factura no encontrada");
  if (!["ISSUED", "PARTIAL"].includes(invoice.status)) {
    throw new Error("La factura no admite pagos");
  }

  const alreadyPaid = paidAmount(invoice.payments);
  const balance = Math.round((invoice.total - alreadyPaid) * 100) / 100;
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

  const payments = await prisma.payment.findMany({ where: { invoiceId } });
  const paid = paidAmount(payments);
  const status = resolvePaymentStatus(invoice.total, paid, invoice.status);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });

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
    include: { invoice: { include: { payments: true } } },
  });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.invoice.status === "VOIDED") {
    throw new Error("No se puede modificar una factura anulada");
  }

  await prisma.payment.delete({ where: { id: paymentId } });

  const payments = await prisma.payment.findMany({
    where: { invoiceId: payment.invoiceId },
  });
  const paid = paidAmount(payments);
  const status = resolvePaymentStatus(
    payment.invoice.total,
    paid,
    payment.invoice.status,
  );
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { status },
  });

  await writeAudit({
    action: "DELETE",
    entity: "Payment",
    entityId: paymentId,
    summary: `Pago eliminado de ${payment.amount} en factura ${payment.invoice.number}`,
  });

  revalidatePay(payment.invoiceId);
  redirect(`/facturas/${payment.invoiceId}`);
}
