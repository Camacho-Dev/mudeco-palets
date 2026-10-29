import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export type ProductWithRecommendation = Product & {
  score: number;
  totalSold: number;
  totalWebOrdered: number;
  timesSold: number;
  badge?: "MÁS VENDIDO" | "MÁS PEDIDO" | "EN TENDENCIA";
};

/**
 * Algoritmo real de métricas y recomendaciones de Mudeco Palets:
 * Basado 100% en transacciones y pedidos registrados en la base de datos:
 * - Ventas confirmadas (InvoiceItem en facturas ISSUED, PAID, PARTIAL)
 * - Pedidos web confirmados (WebOrderItem en WebOrders no cancelados)
 * Sin boosts artificiales ni datos ficticios.
 */
let cachedScored: { data: ProductWithRecommendation[]; expiresAt: number } | null = null;

export function invalidateScoredProductsCache() {
  cachedScored = null;
}

export async function getScoredProducts(): Promise<ProductWithRecommendation[]> {
  const now = Date.now();
  if (cachedScored && cachedScored.expiresAt > now) {
    return cachedScored.data;
  }

  const [products, invoiceItems, webItems] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.invoiceItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      where: {
        productId: { not: null },
        invoice: {
          status: { in: ["ISSUED", "PAID", "PARTIAL"] },
        },
      },
    }),
    prisma.webOrderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      where: {
        productId: { not: null },
        webOrder: {
          status: { not: "CANCELLED" },
        },
      },
    }),
  ]);

  const salesMap = new Map<string, { qty: number; times: number }>();
  for (const item of invoiceItems) {
    if (item.productId) {
      salesMap.set(item.productId, {
        qty: Math.round((item._sum?.quantity || 0) * 100) / 100,
        times: item._count?.id || 0,
      });
    }
  }

  const webMap = new Map<string, { qty: number; times: number }>();
  for (const item of webItems) {
    if (item.productId) {
      webMap.set(item.productId, {
        qty: Math.round((item._sum?.quantity || 0) * 100) / 100,
        times: item._count?.id || 0,
      });
    }
  }

  // Puntuación 100% matemática real
  const scored: ProductWithRecommendation[] = products.map((p) => {
    const sale = salesMap.get(p.id) || { qty: 0, times: 0 };
    const web = webMap.get(p.id) || { qty: 0, times: 0 };

    const score = sale.qty * 3 + sale.times * 2 + web.qty * 3 + web.times * 2;

    return {
      ...p,
      score,
      totalSold: sale.qty,
      totalWebOrdered: web.qty,
      timesSold: sale.times,
    };
  });

  // Ordenar estrictamente de mayor a menor según actividad real
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.totalSold !== a.totalSold) return b.totalSold - a.totalSold;
    return b.totalWebOrdered - a.totalWebOrdered;
  });

  // Asignar insignias ÚNICAMENTE a los productos que tienen ventas o pedidos reales
  const result = scored.map((item) => {
    let badge: ProductWithRecommendation["badge"] = undefined;

    const hasRealSales = item.totalSold > 0;
    const hasRealWebOrders = item.totalWebOrdered > 0;

    if (hasRealSales && hasRealWebOrders) {
      badge = "EN TENDENCIA";
    } else if (hasRealSales && item.totalSold >= 2) {
      badge = "MÁS VENDIDO";
    } else if (hasRealWebOrders) {
      badge = "MÁS PEDIDO";
    } else if (hasRealSales) {
      badge = "MÁS VENDIDO";
    }

    return {
      ...item,
      badge,
    };
  });

  const ttl = process.env.NODE_ENV === "production" ? 60_000 : 20_000;
  cachedScored = { data: result, expiresAt: now + ttl };
  return result;
}

/**
 * Obtiene los productos con mayor volumen real de compra y pedidos
 */
export async function getTopRecommendedProducts(limit = 6): Promise<ProductWithRecommendation[]> {
  const scored = await getScoredProducts();
  // Filtrar primero los que tienen actividad real de compra
  const withSales = scored.filter((p) => p.totalSold > 0 || p.totalWebOrdered > 0);

  if (withSales.length >= limit) {
    return withSales.slice(0, limit);
  }

  // Si hay menos productos vendidos que el límite, completar con el resto pero sin insignias falsas
  return scored.slice(0, limit);
}

/**
 * Obtiene recomendaciones relacionadas basadas en la misma categoría y popularidad real
 */
export async function getRelatedRecommendations(
  currentProductId: string,
  limit = 4,
): Promise<ProductWithRecommendation[]> {
  const scored = await getScoredProducts();
  const current = scored.find((p) => p.id === currentProductId);

  const others = scored.filter((p) => p.id !== currentProductId);

  if (!current) return others.slice(0, limit);

  const sameCategory = others.filter((p) => p.category === current.category);
  const differentCategory = others.filter((p) => p.category !== current.category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}
