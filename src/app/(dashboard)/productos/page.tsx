import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import { formatStoreCategory } from "@/lib/store-brand";
import { ExternalLink } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { Pagination, pageWindow, parsePage } from "@/components/pagination";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  await requireSession();
  const sp = await searchParams;
  const { q, cat } = sp;
  const query = (q || "").trim();
  const categoryFilter = (cat || "").trim();

  const where: Prisma.ProductWhereInput = {
        kind: "FINISHED",
        ...(categoryFilter
          ? { category: { equals: categoryFilter, mode: "insensitive" } }
          : {}),
        ...(query
          ? {
              OR: [
                { id: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
  };
  const PAGE_SIZE = 25;
  const [total, activeCount] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({ where: { kind: "FINISHED", active: true } }),
  ]);
  const pg = pageWindow(parsePage(sp.page), total, PAGE_SIZE);
  const [products, allCategoryRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
      skip: pg.skip,
      take: pg.take,
    }),
    prisma.product.findMany({
      where: { kind: "FINISHED" },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const allCategories = allCategoryRows
    .map((r) => r.category)
    .filter((c) => c && c.toLowerCase() !== "servicios")
    .sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div>
      <PageHeader
        title="Catálogo"
        description={
          query || categoryFilter
            ? `Resultados filtrados${categoryFilter ? ` · ${formatStoreCategory(categoryFilter)}` : ""}${query ? ` · “${query}”` : ""}`
            : `${activeCount} muebles activos visibles en la tienda online`
        }
        action={{ href: "/productos/nuevo", label: "Nuevo mueble" }}
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por nombre, SKU, categoría o descripción…"
          ariaLabel="Buscar en catálogo"
        />
      </Suspense>

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mr-1">
          Categoría:
        </span>
        <Link
          href={query ? `/productos?q=${encodeURIComponent(query)}` : "/productos"}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !categoryFilter
              ? "bg-[var(--wood-950)] text-white shadow-xs"
              : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border border-stone-200"
          }`}
        >
          Todas
        </Link>
        {allCategories.map((c) => {
          const active = categoryFilter.toLowerCase() === c.toLowerCase();
          const params = new URLSearchParams();
          params.set("cat", c);
          if (query) params.set("q", query);
          return (
            <Link
              key={c}
              href={`/productos?${params.toString()}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-[var(--wood-950)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {formatStoreCategory(c)}
            </Link>
          );
        })}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>ITBIS</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-[var(--muted)]">
                  {query || categoryFilter
                    ? "No se encontraron muebles para los filtros seleccionados"
                    : "No hay muebles en el catálogo"}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const img = productImage(p);
                return (
                  <tr key={p.id} className={!p.active ? "opacity-50" : undefined}>
                    <td className="w-14 py-2">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-[var(--border)] bg-[#fbf7f2]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {p.sku || "Sin SKU"}
                        {p.description ? ` · ${p.description}` : ""}
                      </div>
                    </td>
                    <td>{formatStoreCategory(p.category)}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold ${
                          p.stock <= p.minStock
                            ? "bg-amber-100 text-amber-900"
                            : "text-[var(--wood-900)]"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>{(p.taxRate * 100).toFixed(0)}%</td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                          p.active
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {p.active ? "En tienda" : "Inactivo"}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {p.active ? (
                          <a
                            href={`/producto/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[#fbf7f2] px-2 py-1 text-xs text-[var(--wood-800)] hover:border-brand-gold-strong hover:bg-white"
                            title="Ver cómo se ve en la tienda online"
                          >
                            <span>Ver web</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        ) : null}
                        <Link
                          href={`/productos/${p.id}`}
                          className="rounded border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium text-[var(--wood-800)] hover:border-[var(--wood-700)]"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/productos" searchParams={sp} page={pg.current} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
