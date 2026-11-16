"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getVerifiedApiSession } from "@/lib/session";
import { checkDualRateLimit } from "@/lib/rate-limit";
import { invalidateReviewsCache } from "@/lib/reviews";

export type ProductReviewResult = { ok: true; updated: boolean } | { ok: false; error: string };

export async function submitProductReviewAction(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<ProductReviewResult> {
  const session = await getVerifiedApiSession();
  if (!session?.user?.email) {
    return { ok: false, error: "Inicia sesión para dejar tu reseña." };
  }

  const productId = String(input.productId || "").trim();
  const comment = String(input.comment || "").trim();
  const rating = Math.round(Number(input.rating));

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Elige de 1 a 5 estrellas." };
  }
  if (comment.length < 8) {
    return { ok: false, error: "Cuéntanos un poco más (mínimo 8 caracteres)." };
  }
  if (comment.length > 600) {
    return { ok: false, error: "Tu reseña no puede pasar de 600 caracteres." };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, active: true, kind: "FINISHED" },
    select: { id: true, name: true },
  });
  if (!product) return { ok: false, error: "Este producto ya no está disponible." };

  const email = session.user.email.toLowerCase().trim();
  const rl = await checkDualRateLimit({
    scope: "product-review",
    identifier: email,
    ipLimit: 8,
    idLimit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return { ok: false, error: "Has enviado varias reseñas seguidas. Espera unos minutos." };
  }

  // Compra verificada: pedido pagado o entregado que incluya este producto
  const order = await prisma.webOrder.findFirst({
    where: {
      customerEmail: { equals: email, mode: "insensitive" },
      status: { in: ["PAID", "DONE"] },
      items: { some: { productId: product.id } },
    },
    select: { id: true, number: true },
  });

  const data = {
    customerName: (session.user.name || email.split("@")[0]).slice(0, 80),
    customerEmail: email,
    rating,
    comment,
    productId: product.id,
    productName: product.name.slice(0, 120),
    isVerified: Boolean(order),
    webOrderId: order?.id ?? null,
    orderNumber: order?.number ?? null,
    status: "APPROVED",
  };

  const existing = await prisma.customerReview.findFirst({
    where: { productId: product.id, customerEmail: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });

  if (existing) {
    await prisma.customerReview.update({ where: { id: existing.id }, data });
  } else {
    await prisma.customerReview.create({ data });
  }

  invalidateReviewsCache();
  revalidatePath(`/producto/${product.id}`);
  revalidatePath("/");
  revalidatePath("/catalogo");
  return { ok: true, updated: Boolean(existing) };
}

/** Reseña previa del usuario para precargar el formulario (null si no tiene) */
export async function getMyProductReviewAction(
  productId: string,
): Promise<{ rating: number; comment: string } | null> {
  const session = await getVerifiedApiSession();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return null;
  const r = await prisma.customerReview.findFirst({
    where: { productId, customerEmail: { equals: email, mode: "insensitive" } },
    select: { rating: true, comment: true },
  });
  return r;
}
