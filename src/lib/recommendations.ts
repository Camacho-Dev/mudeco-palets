import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export type ProductWithRecommendation = Product & {
  score: number;
  totalSold: number;
  totalWebOrdered: number;
  badge?: "🔥 Más vendido" | "⭐ Más pedido" | "💎 Recomendado";
};

/**
 * Algoritmo de recomendación y tendencias de Mudeco Palets:
 * Calcula un puntaje de popularidad combinando:
 * 1. Ventas reales confirmadas en facturación (InvoiceItem) -> Peso x 3
 * 2. Pedidos y solicitudes web (WebOrderItem) -> Peso x 2
 * 3. Disponibilidad de stock -> Favorece productos con existencias listas
 */
export async function getScoredProducts(): Promise<ProductWithRecommendation[]> {
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
        qty: item._sum?.quantity || 0,
        times: item._count?.id || 0,
      });
    }
  }

  const webMap = new Map<string, { qty: number; times: number }>();
  for (const item of webItems) {
    if (item.productId) {
      webMap.set(item.productId, {
        qty: item._sum?.quantity || 0,
        times: item._count?.id || 0,
      });
    }
  }

  // Si la tienda es nueva y aún hay pocas ventas, damos un boost inicial
  // a categorías clave de muebles para que la recomendación siempre sea atractiva
  const scored = products.map((p) => {
    const sale = salesMap.get(p.id) || { qty: 0, times: 0 };
    const web = webMap.get(p.id) || { qty: 0, times: 0 };

    let baseScore =
      sale.qty * 3 +
      sale.times * 2 +
      web.qty * 2.5 +
      web.times * 1.5;

    // Boost si tiene stock inmediato disponible
    if (p.stock > 0) baseScore += 2;

    // Boost de categoría para arranque (comedores, repisas y mesas tienen alta demanda natural)
    const catLower = p.category.toLowerCase();
    if (catLower.includes("comedor") || catLower.includes("tv") || catLower.includes("mesa")) {
      baseScore += 3;
    }

    return {
      ...p,
      score: baseScore,
      totalSold: sale.qty,
      totalWebOrdered: web.qty,
    };
  });

  // Ordenar de mayor a menor puntuación
  scored.sort((a, b) => b.score - a.score);

  // Asignar insignias de recomendación dinámica a los líderes
  return scored.map((item, index) => {
    let badge: ProductWithRecommendation["badge"];
    if (index === 0 || (item.totalSold >= 2 && index < 3)) {
      badge = "🔥 Más vendido";
    } else if (item.totalWebOrdered >= 1 || index < 4) {
      badge = "⭐ Más pedido";
    } else if (item.score >= 4 && index < 7) {
      badge = "💎 Recomendado";
    }

    return {
      ...item,
      badge,
    };
  });
}

/**
 * Obtiene los productos más comprados y pedidos para estantes destacados
 */
export async function getTopRecommendedProducts(limit = 6): Promise<ProductWithRecommendation[]> {
  const scored = await getScoredProducts();
  return scored.slice(0, limit);
}

/**
 * Obtiene recomendaciones inteligentes relacionadas a un producto específico
 * (mismo estilo o categoría, o complementarios más vendidos)
 */
export async function getRelatedRecommendations(
  currentProductId: string,
  limit = 4,
): Promise<ProductWithRecommendation[]> {
  const scored = await getScoredProducts();
  const current = scored.find((p) => p.id === currentProductId);

  const others = scored.filter((p) => p.id !== currentProductId);

  if (!current) return others.slice(0, limit);

  // Priorizar misma categoría primero, luego los de mayor score general
  const sameCategory = others.filter((p) => p.category === current.category);
  const differentCategory = others.filter((p) => p.category !== current.category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}
