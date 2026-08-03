import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";

export const metadata = {
  title: "Catálogo",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const query = (q || "").trim();
  const category = (cat || "").trim();

  const products = await prisma.product.findMany({
    where: {
      active: true,
      kind: "FINISHED",
      ...(category ? { category } : {}),
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

  const categories = await prisma.product.findMany({
    where: { active: true, kind: "FINISHED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return (
    <div>
      <div className="relative overflow-hidden bg-[#2f2018] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url(/brand/store-craft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#2f2018]/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
              Tienda
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl">Catálogo</h1>
            <p className="mt-3 max-w-lg text-white/65">
              Explora muebles hechos con madera recuperada. Filtra por categoría
              o busca por nombre.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <form className="flex flex-col gap-3 sm:flex-row" method="get">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar mueble…"
            className="input flex-1"
          />
          {category ? <input type="hidden" name="cat" value={category} /> : null}
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className={`rounded-full border px-3.5 py-1.5 text-[0.7rem] tracking-wide uppercase transition ${
              !category
                ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
            }`}
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/catalogo?cat=${encodeURIComponent(c.category)}${
                query ? `&q=${encodeURIComponent(query)}` : ""
              }`}
              className={`rounded-full border px-3.5 py-1.5 text-[0.7rem] tracking-wide uppercase transition ${
                category === c.category
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
              }`}
            >
              {c.category}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-[var(--muted)]">
            No hay productos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
