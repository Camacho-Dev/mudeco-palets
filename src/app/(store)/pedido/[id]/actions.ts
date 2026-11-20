"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { attachReceiptToNotes } from "@/lib/order-receipt";
import { processReceiptFile } from "@/lib/order-receipt-server";
import { writeAudit } from "@/lib/audit";
import { getVerifiedApiSession } from "@/lib/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { siteUrl } from "@/lib/store-info";
import { redirect } from "next/navigation";

import { checkDualRateLimit } from "@/lib/rate-limit";

export async function uploadOrderReceiptAction(orderId: string, formData: FormData) {
  try {
    if (!orderId || typeof orderId !== "string") {
      return { success: false, error: "Identificador de pedido inválido" };
    }

    const session = await getVerifiedApiSession().catch(() => null);

    // Rate limit dual (por IP y por pedido) para evitar flooding o sobreescrituras masivas
    const rl = await checkDualRateLimit({
      scope: "receipt-upload",
      identifier: orderId,
      ipLimit: 8,
      idLimit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.ok) {
      return {
        success: false,
        error: "Demasiados intentos de carga para este pedido. Espera unos minutos.",
      };
    }

    const order = await prisma.webOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Pedido no encontrado en el sistema" };
    }

    // Verificar autorización estricta: SOLO la cuenta titular del pedido puede subir o cambiar el comprobante desde la tienda
    const ownerUser = Boolean(
      session?.user?.email &&
        order.customerEmail &&
        session.user.email.toLowerCase() === order.customerEmail.toLowerCase(),
    );
    if (!ownerUser) {
      return {
        success: false,
        error: "Este pedido pertenece a otra cuenta. Inicia sesión con el correo titular del pedido.",
      };
    }

    // Impedir modificar comprobantes de pedidos ya pagados, finalizados o cancelados
    if (["PAID", "DONE", "CANCELLED"].includes(order.status)) {
      return {
        success: false,
        error: "Este pedido ya fue procesado y no admite nuevos comprobantes.",
      };
    }

    const file = formData.get("receipt") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Por favor selecciona un archivo de comprobante" };
    }

    const receipt = await processReceiptFile(file, `recibo_${order.number}`);
    const updatedNotes = attachReceiptToNotes(order.notes, receipt);

    await prisma.webOrder.update({
      where: { id: orderId },
      data: {
        notes: updatedNotes,
        ...(order.status === "PENDING" || order.status === "AWAITING_PAYMENT"
          ? { status: "IN_PROGRESS" }
          : {}),
      },
    });

    await writeAudit({
      action: "WEB_ORDER_RECEIPT_UPLOAD",
      entity: "WebOrder",
      entityId: order.id,
      summary: `Cliente subió comprobante para ${order.number} (${receipt.name})`,
      userId: session?.user?.id,
      userEmail: session?.user?.email || order.customerEmail,
      userName: session?.user?.name || order.customerName,
    }).catch(() => undefined);

    revalidatePath(`/pedido/${orderId}`);
    revalidatePath(`/pedidos-web/${orderId}`);
    revalidatePath("/pedidos-web");
    revalidatePath("/mis-pedidos");

    return { success: true, receipt };
  } catch (error) {
    console.error("Error al subir comprobante de pedido:", error);
    return {
      success: false,
      error: "Error inesperado al subir el comprobante",
    };
  }
}

export async function retryStripeCheckoutAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId || !isStripeConfigured()) return;

  const session = await getVerifiedApiSession().catch(() => null);
  const order = await prisma.webOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (
    !order ||
    order.status !== "AWAITING_PAYMENT" ||
    !session?.user?.email ||
    order.customerEmail.toLowerCase() !== session.user.email.toLowerCase()
  ) {
    return;
  }

  const stripe = getStripe();
  const base = siteUrl();

  if (order.stripeSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (existing.status === "open" && existing.url) {
        redirect(existing.url);
      }
    } catch {
      /* crear nueva sesión si la anterior expiró */
    }
  }

  const payNow =
    order.madeToOrder && order.amountDueNow != null
      ? order.amountDueNow
      : order.total;

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail,
    client_reference_id: order.id,
    metadata: {
      webOrderId: order.id,
      invoiceId: order.invoiceId || "",
      madeToOrder: order.madeToOrder ? "1" : "0",
    },
    line_items: [
      {
        price_data: {
          currency: "dop",
          product_data: {
            name: order.madeToOrder
              ? `Abono inicial pedido ${order.number}`
              : `Pedido ${order.number} · Mudeco Palets`,
          },
          unit_amount: Math.round(payNow * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/pedido/${order.id}?ok=online`,
    cancel_url: `${base}/pedido/${order.id}?cancel=1`,
  });

  await prisma.webOrder.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  if (checkout.url) redirect(checkout.url);
}

export async function cancelPendingWebOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return;

  const session = await getVerifiedApiSession().catch(() => null);
  const order = await prisma.webOrder.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, customerEmail: true, invoiceId: true },
  });
  if (
    !order ||
    order.status !== "AWAITING_PAYMENT" ||
    !session?.user?.email ||
    order.customerEmail.toLowerCase() !== session.user.email.toLowerCase()
  ) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.webOrder.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    if (order.invoiceId) {
      await tx.invoice.updateMany({
        where: { id: order.invoiceId, status: "DRAFT" },
        data: { status: "VOIDED" },
      });
    }
  });

  revalidatePath(`/pedido/${orderId}`);
  revalidatePath("/mis-pedidos");
  revalidatePath("/pedidos-web");
  revalidatePath("/facturas");
}
