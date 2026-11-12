import type { MetadataRoute } from "next";
import { prisma, withDbRetry } from "@/lib/prisma";
import { siteUrl } from "@/lib/store-info";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [products, categories] = await Promise.all([
    withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          select: { id: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        }),
      { fallback: [] },
    ),
    withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          select: { category: true },
          distinct: ["category"],
        }),
      { fallback: [] },
    ),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .map((c) => c.category)
    .filter(Boolean)
    .map((cat) => ({
      url: `${base}/catalogo?cat=${encodeURIComponent(cat)}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${base}/catalogo`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${base}/nosotros`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/contacto`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/terminos`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${base}/privacidad`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
