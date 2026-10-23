import type { MetadataRoute } from "next";
import { prisma, withDbRetry } from "@/lib/prisma";
import { siteUrl } from "@/lib/store-info";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const products = await withDbRetry(
    () =>
      prisma.product.findMany({
        where: { active: true, kind: "FINISHED" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    { fallback: [] },
  );

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${base}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${base}/reparaciones`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${base}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticEntries, ...productEntries];
}
