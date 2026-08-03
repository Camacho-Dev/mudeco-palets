import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency } from "@/lib/format";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const products = await prisma.product.findMany({
    where: {
      kind: "FINISHED",
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
    },
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Catálogo"
        description={
          query
            ? `Resultados para “${query}”`
            : "Muebles de venta y fabricación propia"
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

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>ITBIS</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron muebles para “${query}”`
                    : "No hay muebles en el catálogo"}
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={!p.active ? "opacity-50" : undefined}>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {p.sku || "Sin SKU"}
                      {p.description ? ` · ${p.description}` : ""}
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{(p.taxRate * 100).toFixed(0)}%</td>
                  <td>{p.active ? "Activo" : "Inactivo"}</td>
                  <td className="text-right">
                    <Link
                      href={`/productos/${p.id}`}
                      className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
