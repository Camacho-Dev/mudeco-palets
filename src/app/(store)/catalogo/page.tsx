import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/store/store-motion";
import { getScoredProducts } from "@/lib/recommendations";
import { getStoreCompany } from "@/lib/store";
import { CatalogExplorer } from "@/components/store/catalog-explorer";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Catálogo de Piezas",
  description:
    "Muebles hechos a mano con madera de pino recuperada y curada en República Dominicana.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; filter?: string }>;
}) {
  const { q, cat, filter } = await searchParams;
  const initialQuery = (q || "").trim();
  const initialCategory = (cat || "").trim();
  const initialFilter = (filter || "").trim();

  const [products, scoredProducts, company] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    getScoredProducts(),
    getStoreCompany(),
  ]);

  const categories: string[] = Array.from(
    new Set(products.map((p) => p.category))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const badges: Record<string, string> = {};
  for (const s of scoredProducts) {
    if (s.badge) badges[s.id] = s.badge;
  }

  const popularIds = scoredProducts.slice(0, 8).map((s) => s.id);

  return (
    <div className="bg-[#faf7f2] min-h-screen">
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden bg-[#16120f] text-[#faf6f1] border-b border-[#c9a15a]/20">
        <div
          className="absolute inset-0 opacity-25 scale-105"
          style={{
            backgroundImage: "url(/brand/store-craft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#16120f] via-[#16120f]/85 to-[#16120f]/60" />

        {/* Ambient gold glow */}
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-[#c9a15a]/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1760px] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-black/40 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Colección Artesanal
            </div>
            <h1 className="font-display mt-3 text-4xl md:text-5xl text-white">
              Catálogo de Piezas
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
              Muebles hechos a mano con madera de pino recuperada y curada. Diseños listos para entrega inmediata o proyectos configurados a tus dimensiones.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1760px] px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <CatalogExplorer
          products={products}
          categories={categories}
          badges={badges}
          popularIds={popularIds}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          initialFilter={initialFilter}
          companyPhone={company.phone}
        />
      </div>
    </div>
  );
}
