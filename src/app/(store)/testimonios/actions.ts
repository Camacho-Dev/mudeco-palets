"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkDualRateLimit } from "@/lib/rate-limit";
import { invalidateReviewsCache } from "@/lib/reviews";
import { auth } from "@/lib/auth";
import { isAdmin, isStaff } from "@/lib/rbac";
import {
  MAX_REPLIES_PER_REVIEW,
  parseReviewReplies,
  sanitizeHandle,
  serializeReviewReplies,
  type ReviewReplyItem,
} from "@/lib/review-replies";

export type SubmitReviewResult = {
  success: boolean;
  id?: string;
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

  if (!customerName || customerName.length < 2 || customerName.length > 80) {
    return { success: false, error: "Por favor introduce tu nombre completo." };
  }

  if (!comment || comment.length < 8) {
    return { success: false, error: "Tu testimonio debe tener al menos 8 caracteres." };
  }

  if (comment.length > 600) {
    return { success: false, error: "Tu testimonio no puede exceder los 600 caracteres." };
  }

  const rating = Math.min(5, Math.max(1, Math.round(Number.isFinite(ratingRaw) ? ratingRaw : 5)));

  // Rate limit dual (por IP y por email/nombre) para prevenir spam con nombres rotativos
  const rlKey = customerEmail || customerName.toLowerCase();
  const rl = await checkDualRateLimit({
    scope: "review",
    identifier: rlKey,
    ipLimit: 5,
    idLimit: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return {
      success: false,
      error: "Has enviado varios testimonios recientemente. Por favor espera unos minutos.",
    };
  }

  let isVerified = false;
  let finalWebOrderId: string | undefined = undefined;
  let finalProductName = productName;

  // Verificar autenticidad real del pedido (evitar spoofing de códigos secuenciales WEB-2026-0001)
  if (webOrderId || (orderNumber && customerEmail)) {
    const existingOrder = await prisma.webOrder.findFirst({
      where: {
        type: "SALE",
        ...(webOrderId
          ? { id: webOrderId }
          : {
              number: orderNumber,
              customerEmail: { equals: customerEmail, mode: "insensitive" },
            }),
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
    const created = await prisma.customerReview.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        rating,
        comment,
        city: city.slice(0, 60) || "República Dominicana",
        productName: finalProductName ? finalProductName.slice(0, 120) : null,
        orderNumber: isVerified ? orderNumber || null : null,
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

    return { success: true, id: created.id };
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
  const safeDelta = delta === -1 ? -1 : 1;

  if (!reviewId || reviewId.startsWith("temp-") || reviewId.startsWith("yt-")) {
    return { success: true, likes: Math.max(0, safeDelta) };
  }

  const rl = await checkDualRateLimit({
    scope: "review-like",
    identifier: reviewId,
    ipLimit: 15,
    idLimit: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return { success: false, error: "Demasiadas interacciones seguidas" };
  }

  try {
    const current = await prisma.customerReview.findUnique({
      where: { id: reviewId },
      select: { likes: true },
    });
    if (!current) {
      return { success: false, error: "Testimonio no encontrado" };
    }

    const nextLikes = Math.max(0, current.likes + safeDelta);
    const updated = await prisma.customerReview.update({
      where: { id: reviewId },
      data: { likes: nextLikes },
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
  options: { authorName?: string; replyToHandle?: string | null } = {},
): Promise<{ success: boolean; error?: string; replies?: ReviewReplyItem[] }> {
  if (!reviewId || typeof reviewId !== "string" || reviewId.startsWith("yt-")) {
    return {
      success: false,
      error: "Este comentario aún se está sincronizando. Recarga la página e inténtalo de nuevo.",
    };
  }

  const session = await auth();
  const staff = Boolean(session?.user && isStaff(session.user.role));

  const reply = String(replyText || "").trim();
  if (!reply || reply.length < 2 || reply.length > 600) {
    return { success: false, error: "La respuesta debe tener entre 2 y 600 caracteres." };
  }

  const authorName = staff
    ? "Mudeco Palets"
    : String(session?.user?.name || options.authorName || "").trim().slice(0, 60);
  if (!staff && authorName.length < 2) {
    return { success: false, error: "Escribe tu nombre para poder responder." };
  }

  const rl = await checkDualRateLimit({
    scope: "review-reply",
    identifier: session?.user?.email || authorName.toLowerCase(),
    ipLimit: staff ? 40 : 6,
    idLimit: staff ? 40 : 4,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return {
      success: false,
      error: "Has enviado varias respuestas seguidas. Espera unos minutos.",
    };
  }

  try {
    const current = await prisma.customerReview.findUnique({
      where: { id: reviewId },
      select: { officialReply: true, officialReplyAt: true, status: true },
    });
    if (!current || current.status !== "APPROVED") {
      return { success: false, error: "Comentario no encontrado." };
    }

    const existing = parseReviewReplies(current.officialReply, current.officialReplyAt);
    if (existing.length >= MAX_REPLIES_PER_REVIEW) {
      return { success: false, error: "Este hilo alcanzó el máximo de respuestas." };
    }

    const now = new Date();
    const newReply: ReviewReplyItem = {
      id: `r-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      authorName,
      isOfficial: staff,
      text: reply,
      replyToHandle: sanitizeHandle(options.replyToHandle),
      createdAt: now.toISOString(),
    };
    const nextReplies = [...existing, newReply];

    await prisma.customerReview.update({
      where: { id: reviewId },
      data: {
        officialReply: serializeReviewReplies(nextReplies),
        officialReplyAt: now,
      },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    return { success: true, replies: nextReplies };
  } catch (err) {
    console.error("Error al responder comentario:", err);
    return { success: false, error: "No se pudo guardar la respuesta." };
  }
}

export async function deleteReviewReplyAction(
  reviewId: string,
  replyId: string,
): Promise<{ success: boolean; error?: string; replies?: ReviewReplyItem[] }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { success: false, error: "Solo el administrador puede eliminar respuestas." };
  }

  try {
    const current = await prisma.customerReview.findUnique({
      where: { id: reviewId },
      select: { officialReply: true, officialReplyAt: true },
    });
    if (!current) {
      return { success: false, error: "Comentario no encontrado." };
    }

    const nextReplies = parseReviewReplies(current.officialReply, current.officialReplyAt).filter(
      (r) => r.id !== replyId,
    );

    await prisma.customerReview.update({
      where: { id: reviewId },
      data: {
        officialReply: serializeReviewReplies(nextReplies),
        officialReplyAt: nextReplies.length
          ? new Date(nextReplies[nextReplies.length - 1].createdAt)
          : null,
      },
    });

    invalidateReviewsCache();
    revalidatePath("/");
    return { success: true, replies: nextReplies };
  } catch (err) {
    console.error("Error al eliminar respuesta:", err);
    return { success: false, error: "No se pudo eliminar la respuesta." };
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
