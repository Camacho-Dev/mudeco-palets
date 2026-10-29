"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { invalidateReviewsCache } from "@/lib/reviews";
import { auth } from "@/lib/auth";
import { isAdmin, isStaff } from "@/lib/rbac";

export type SubmitReviewResult = {
  success: boolean;
  error?: string;
};

export async function submitCustomerReviewAction(formData: FormData): Promise<SubmitReviewResult> {
  const customerName = String(formData.get("customerName") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase();
  const ratingRaw = Number(formData.get("rating") || 5);
  const comment = String(formData.get("comment") || "").trim();
  const city = String(formData.get("city") || "Santo Domingo").trim();
  const productName = String(formData.get("productName") || "").trim() || undefined;
  const orderNumber = String(formData.get("orderNumber") || "").trim() || undefined;
  const webOrderId = String(formData.get("webOrderId") || "").trim() || undefined;

  if (!customerName || customerName.length < 2) {
    return { success: false, error: "Por favor introduce tu nombre completo." };
  }

  if (!comment || comment.length < 8) {
    return { success: false, error: "Tu testimonio debe tener al menos 8 caracteres." };
  }

  if (comment.length > 600) {
    return { success: false, error: "Tu testimonio no puede exceder los 600 caracteres." };
  }

  const rating = Math.min(5, Math.max(1, Math.round(ratingRaw)));

  // Rate limit para prevenir spam (máximo 4 reseñas por email/nombre en 10 min)
  const rlKey = customerEmail ? `review:${customerEmail}` : `review:name:${customerName.toLowerCase()}`;
  const rl = checkRateLimit(rlKey, 4, 10 * 60 * 1000);
  if (!rl.ok) {
    return {
      success: false,
      error: "Has enviado varios testimonios recientemente. Por favor espera unos minutos.",
    };
  }

  let isVerified = false;
  let finalWebOrderId: string | undefined = webOrderId;
  let finalProductName = productName;

  // Si proporcionó orden o id de orden, verificar existencia en la base de datos
  if (webOrderId || orderNumber) {
    const existingOrder = await prisma.webOrder.findFirst({
      where: {
        OR: [
          ...(webOrderId ? [{ id: webOrderId }] : []),
          ...(orderNumber ? [{ number: orderNumber }] : []),
        ],
      },
      include: {
        items: true,
      },
    });

    if (existingOrder) {
      isVerified = true;
      finalWebOrderId = existingOrder.id;
      if (!finalProductName && existingOrder.items.length > 0) {
        finalProductName = existingOrder.items[0].description;
      }
    }
  }

  try {
    await prisma.customerReview.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        rating,
        comment,
        city: city || "República Dominicana",
        productName: finalProductName || null,
        orderNumber: orderNumber || null,
        isVerified,
        status: "APPROVED",
        webOrderId: finalWebOrderId || null,
      },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    if (finalWebOrderId) {
      revalidatePath(`/pedido/${finalWebOrderId}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Error al registrar testimonio de cliente:", err);
    return {
      success: false,
      error: "Ocurrió un error al guardar tu testimonio. Inténtalo nuevamente.",
    };
  }
}

export async function toggleReviewLikeAction(
  reviewId: string,
  delta: 1 | -1 = 1,
): Promise<{ success: boolean; likes?: number; error?: string }> {
  if (!reviewId || reviewId.startsWith("temp-") || reviewId.startsWith("yt-")) {
    return { success: true, likes: Math.max(0, delta) };
  }

  try {
    const updated = await prisma.customerReview.update({
      where: { id: reviewId },
      data: {
        likes: {
          increment: delta,
        },
      },
      select: { likes: true },
    });

    invalidateReviewsCache();
    return { success: true, likes: updated.likes };
  } catch (err) {
    console.error("Error updating review likes:", err);
    return { success: false, error: "No se pudo actualizar el like" };
  }
}

export async function submitReviewReplyAction(
  reviewId: string,
  replyText: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    return {
      success: false,
      error: "Solo el equipo de Mudeco Palets puede publicar respuestas oficiales.",
    };
  }

  const reply = replyText.trim();
  if (!reply || reply.length < 3) {
    return { success: false, error: "La respuesta debe tener al menos 3 caracteres." };
  }

  try {
    await prisma.customerReview.update({
      where: { id: reviewId },
      data: {
        officialReply: reply,
        officialReplyAt: new Date(),
      },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error al responder comentario:", err);
    return { success: false, error: "No se pudo guardar la respuesta." };
  }
}

export async function toggleReviewPinAction(
  reviewId: string,
): Promise<{ success: boolean; isPinned?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { success: false, error: "Solo el administrador puede fijar comentarios." };
  }

  try {
    const existing = await prisma.customerReview.findUnique({
      where: { id: reviewId },
      select: { isPinned: true },
    });
    if (!existing) {
      return { success: false, error: "Comentario no encontrado." };
    }

    const updated = await prisma.customerReview.update({
      where: { id: reviewId },
      data: { isPinned: !existing.isPinned },
      select: { isPinned: true },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    return { success: true, isPinned: updated.isPinned };
  } catch (err) {
    console.error("Error al fijar comentario:", err);
    return { success: false, error: "No se pudo actualizar el comentario." };
  }
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { success: false, error: "Solo el administrador puede eliminar comentarios." };
  }

  try {
    await prisma.customerReview.delete({
      where: { id: reviewId },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error al eliminar comentario:", err);
    return { success: false, error: "No se pudo eliminar el comentario." };
  }
}
