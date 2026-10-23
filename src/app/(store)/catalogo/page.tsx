import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/store-motion";
import { getScoredProducts } from "@/lib/recommendations";
import Link from "next/link";
import { Search, Sparkles, X, MessageCircle, SlidersHorizontal } from "lucide-react";
import { getStoreCompany } from "@/lib/store";
import { storeWhatsApp } from "@/lib/store-info";

export const metadata = {
  title: "Catálogo",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; filter?: string }>;
}) {
  const { q, cat, filter } = await searchParams;
  const query = (q || "").trim();
  const category = (cat || "").trim();
  const isPopular = filter === "popular";

  const [scoredProducts, company] = await Promise.all([
    getScoredProducts(),
    getStoreCompany(),
  ]);
  const badgeMap = new Map(scoredProducts.map((s) => [s.id, s.badge]));

  let products = await prisma.product.findMany({
    where: {
      active: true,
      kind: "FINISHED",
      ...(category
        ? { category: { equals: category, mode: "insensitive" } }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  if (isPopular) {
    const popularIds = new Set(scoredProducts.slice(0, 8).map((s) => s.id));
    products = products.filter((p) => popularIds.has(p.id));
  }

  const categories = await prisma.product.findMany({
    where: { active: true, kind: "FINISHED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const hasActiveFilters = Boolean(query || category || isPopular);

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

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-black/40 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Colección Artesanal
            </div>
            <h1 className="font-display mt-3 text-4xl md:text-5xl text-white">Catálogo de Piezas</h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
              Muebles hechos a mano con madera de pino recuperada y curada. Diseños listos para entrega inmediata o proyectos configurados a tus dimensiones.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-[#e4d8cb] bg-white p-4 sm:p-5 shadow-sm">
          <form className="flex flex-col gap-3 sm:flex-row" method="get">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Buscar por mesa, repisa, cómoda, madera..."
                className="input pl-10 h-11 text-sm bg-[#faf8f5] focus:bg-white"
              />
              {query ? (
                <Link
                  href="/catalogo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-black"
                >
                  <X className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            {category ? <input type="hidden" name="cat" value={category} /> : null}
            <button type="submit" className="btn btn-primary h-11 px-6 text-xs tracking-wider uppercase">
              Buscar
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-4 pt-4 border-t border-[#f0e6db] flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] font-bold tracking-wider text-[var(--muted)] uppercase mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              Filtro:
            </span>

            <Link
              href="/catalogo"
              className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] tracking-wider uppercase transition-all duration-200 ${
                !category && !isPopular
                  ? "border-[var(--brand)] bg-[var(--brand)] text-[#faf6f1] shadow-sm font-semibold"
                  : "border-[#e4d8cb] bg-white text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              }`}
            >
              Todas
            </Link>

            <Link
              href="/catalogo?filter=popular"
              className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-bold tracking-wider uppercase transition-all duration-200 ${
                isPopular
                  ? "border-[#c9a15a] bg-[#c9a15a] text-[#111111] shadow-[0_0_12px_rgba(201,161,90,0.35)]"
                  : "border-[#c9a15a]/50 bg-[#fdfaf5] text-[#8a682a] hover:border-[#c9a15a] hover:bg-[#c9a15a]/10"
              }`}
            >
              ★ Más vendidos
            </Link>

            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/catalogo?cat=${encodeURIComponent(c.category)}${
                  query ? `&q=${encodeURIComponent(query)}` : ""
                }`}
                className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] tracking-wider uppercase transition-all duration-200 ${
                  category === c.category
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[#faf6f1] shadow-sm font-semibold"
                    : "border-[#e4d8cb] bg-white text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                }`}
              >
                {c.category}
              </Link>
            ))}

            {hasActiveFilters ? (
              <Link
                href="/catalogo"
                className="ml-auto text-[0.65rem] font-semibold text-rose-700 hover:underline tracking-wider uppercase"
              >
                Limpiar filtros ×
              </Link>
            ) : null}
          </div>
        </div>

        {/* Results summary bar */}
        <div className="mt-6 flex items-center justify-between text-xs text-[var(--muted)] px-1">
          <p>
            Mostrando <span className="font-bold text-[var(--wood-950)]">{products.length}</span>{" "}
            {products.length === 1 ? "mueble disponible" : "muebles disponibles"}
            {category ? ` en ${category}` : ""}
            {query ? ` para "${query}"` : ""}
          </p>
          <span className="hidden sm:inline-block">Madera 100% curada y tratada</span>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#e4d8cb] bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-display text-2xl text-[var(--wood-950)]">
              No encontramos muebles para esta búsqueda
            </p>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
              ¿No ves lo que necesitas? Fabricamos cualquier mueble a medida o restauramos el tuyo en nuestro taller.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/catalogo" className="btn btn-primary text-xs uppercase tracking-wider">
                Ver todo el catálogo
              </Link>
              <a
                href={storeWhatsApp(
                  company.phone,
                  `Hola Mudeco Palets, busco un mueble con características: ${query || category || "a medida"}. ¿Lo fabrican?`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary text-xs uppercase tracking-wider"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.04, 0.24)}>
                <ProductCard product={p} badge={badgeMap.get(p.id)} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

