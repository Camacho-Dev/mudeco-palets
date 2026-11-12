"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { attachReceiptToNotes } from "@/lib/order-receipt";
import { processReceiptFile } from "@/lib/order-receipt-server";
import { writeAudit } from "@/lib/audit";
import { getVerifiedApiSession } from "@/lib/session";

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
