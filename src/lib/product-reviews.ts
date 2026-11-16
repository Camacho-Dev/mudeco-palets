import { prisma, withDbRetry } from "@/lib/prisma";

export type RatingSummary = {
  average: number;
  count: number;
  /** cantidad de reseñas por estrellas: índice 0 = 1★ … 4 = 5★ */
  distribution: [number, number, number, number, number];
};

export type ProductReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  city: string | null;
  isVerified: boolean;
  officialReply: string | null;
  createdAt: Date;
};

const EMPTY: RatingSummary = { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

/** Nombre corto y privado: "Carolina M." */
export function publicName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Cliente";
  const first = parts[0];
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : "";
  return `${first.charAt(0).toUpperCase()}${first.slice(1)}${last}`;
}

export async function getProductRatingSummary(productId: string): Promise<RatingSummary> {
  const rows = await withDbRetry(
    () =>
      prisma.customerReview.groupBy({
        by: ["rating"],
        where: { productId, status: "APPROVED" },
        _count: { _all: true },
      }),
    { fallback: [] as { rating: number; _count: { _all: number } }[] },
  );
  if (!rows.length) return EMPTY;
  const distribution: RatingSummary["distribution"] = [0, 0, 0, 0, 0];
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    const stars = Math.min(5, Math.max(1, r.rating));
    distribution[stars - 1] += r._count._all;
    total += r._count._all;
    sum += stars * r._count._all;
  }
  return { average: Math.round((sum / total) * 10) / 10, count: total, distribution };
}

export async function getProductReviews(productId: string, take = 30): Promise<ProductReview[]> {
  const rows = await withDbRetry(
    () =>
      prisma.customerReview.findMany({
        where: { productId, status: "APPROVED" },
        orderBy: [{ isPinned: "desc" }, { isVerified: "desc" }, { createdAt: "desc" }],
        take,
        select: {
          id: true,
          customerName: true,
          rating: true,
          comment: true,
          city: true,
          isVerified: true,
          officialReply: true,
          createdAt: true,
        },
      }),
    { fallback: [] },
  );
  return rows.map((r) => ({ ...r, customerName: publicName(r.customerName) }));
}

export type ProductRating = { average: number; count: number; score: number };

/**
 * Calificación de todos los productos reseñados.
 * `score` es un promedio bayesiano (con 3 votos "fantasma" en la media global)
 * para que 1 reseña de 5★ no supere a 20 reseñas de 4.8★.
 */
export async function getProductRatings(): Promise<Map<string, ProductRating>> {
  const rows = await withDbRetry(
    () =>
      prisma.customerReview.groupBy({
        by: ["productId"],
        where: { status: "APPROVED", productId: { not: null } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    { fallback: [] as { productId: string | null; _avg: { rating: number | null }; _count: { _all: number } }[] },
  );
  const map = new Map<string, ProductRating>();
  if (!rows.length) return map;
  const totalCount = rows.reduce((s, r) => s + r._count._all, 0);
  const globalAvg = rows.reduce((s, r) => s + (r._avg.rating || 0) * r._count._all, 0) / totalCount;
  const PRIOR = 3;
  for (const r of rows) {
    if (!r.productId) continue;
    const avg = r._avg.rating || 0;
    const n = r._count._all;
    map.set(r.productId, {
      average: Math.round(avg * 10) / 10,
      count: n,
      score: (avg * n + globalAvg * PRIOR) / (n + PRIOR),
    });
  }
  return map;
}

/** Ids de productos ordenados por gusto de los clientes (mejor primero) */
export async function getTopRatedProductIds(limit = 8, minReviews = 1) {
  const ratings = await getProductRatings();
  return [...ratings.entries()]
    .filter(([, r]) => r.count >= minReviews && r.average >= 4)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([id]) => id);
}

export type HomeTestimonial = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  productId: string | null;
  productName: string | null;
};

/** Reseñas reales para la portada: bien valoradas, con comentario sustancial, verificadas primero */
export async function getHomeTestimonials(limit = 3): Promise<HomeTestimonial[]> {
  const rows = await withDbRetry(
    () =>
      prisma.customerReview.findMany({
        where: { status: "APPROVED", rating: { gte: 4 } },
        orderBy: [{ isPinned: "desc" }, { isVerified: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
        take: limit * 4,
        select: {
          id: true,
          customerName: true,
          rating: true,
          comment: true,
          isVerified: true,
          productId: true,
          productName: true,
        },
      }),
    { fallback: [] },
  );
  return rows
    .filter((r) => r.comment.trim().length >= 25)
    .slice(0, limit)
    .map((r) => ({ ...r, customerName: publicName(r.customerName) }));
}
