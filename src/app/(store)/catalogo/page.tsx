import { Reveal } from "@/components/store/store-motion";
import { getScoredProducts } from "@/lib/recommendations";
import { getStoreCompany } from "@/lib/store";
import { withDbRetry } from "@/lib/prisma";
import { CatalogExplorer } from "@/components/store/catalog-explorer";
import Link from "next/link";
import { Sparkles, ShieldCheck, Truck, Ruler, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Catálogo de Piezas",
  description:
    "Muebles hechos a mano con madera de pino recuperada y curada en República Dominicana.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const { q, cat, filter, minPrice, maxPrice } = await searchParams;
  const initialQuery = (q || "").trim();
  const initialCategory = (cat || "").trim();
  const initialFilter = (filter || "").trim();
  const initialMinPrice = minPrice ? Number(minPrice) : undefined;
  const initialMaxPrice = maxPrice ? Number(maxPrice) : undefined;

  const [scoredProducts, company] = await Promise.all([
    withDbRetry(() => getScoredProducts(), { fallback: [] }),
    getStoreCompany(),
  ]);

  const products = scoredProducts || [];

  const categories: string[] = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const badges: Record<string, string> = {};
  for (const s of scoredProducts) {
    if (s.badge) badges[s.id] = s.badge;
  }

  const popularIds = scoredProducts.slice(0, 8).map((s) => s.id);

  return (
    <div className="bg-[#faf7f2] min-h-screen">
      {/* Editorial Luxury Header Banner with full clearance for fixed 90px header */}
      <section className="relative overflow-hidden bg-[#14100d] text-[#faf6f1] border-b border-[#c9a15a]/25 pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-18">
        <div
          className="absolute inset-0 opacity-20 scale-105"
          style={{
            backgroundImage: "url(/brand/store-craft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14100d] via-[#14100d]/90 to-[#14100d]/70" />

        {/* Ambient gold glow */}
        <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#c9a15a]/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-[0.72rem] tracking-wider text-white/50 uppercase">
              <Link href="/" className="hover:text-[#c9a15a] transition-colors">
                Inicio
              </Link>
              <ChevronRight className="h-3 w-3 text-white/30" />
              <span className="text-[#c9a15a] font-medium">Catálogo Artesanal</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/40 bg-black/40 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.22em] text-[#d4af37] uppercase backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-[#d4af37]" />
              Colección Artesanal · Taller Santo Domingo Oeste
            </div>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl md:text-6xl text-white tracking-tight">
              Catálogo de Piezas
            </h1>

            <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-white/75 leading-relaxed font-light">
              Muebles hechos a mano con madera de pino recuperada y curada contra humedad y plagas. Diseños listos para entrega inmediata o proyectos a medida adaptados a tu espacio.
            </p>

            {/* Atelier Quality Highlights Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/10 pt-6 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c9a15a]" />
                <span className="font-semibold text-white">{products.length} muebles</span> disponibles
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/40">·</div>
              <div className="flex items-center gap-1.5 text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-[#c9a15a]" />
                Madera 100% curada y tratada
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/40">·</div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Ruler className="h-3.5 w-3.5 text-[#c9a15a]" />
                Ajustable a tus medidas
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/40">·</div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Truck className="h-3.5 w-3.5 text-[#c9a15a]" />
                Envíos a todo el país
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1760px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        <CatalogExplorer
          products={products}
          categories={categories}
          badges={badges}
          popularIds={popularIds}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          initialFilter={initialFilter}
          initialMinPrice={initialMinPrice}
          initialMaxPrice={initialMaxPrice}
          companyPhone={company.phone}
        />
      </div>
    </div>
  );
}
