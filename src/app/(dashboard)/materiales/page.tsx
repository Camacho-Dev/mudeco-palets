import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function MaterialesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const searchFilter = query
    ? {
        OR: [
          { id: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
          { sku: { contains: query, mode: "insensitive" as const } },
          { category: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [materials, moves] = await Promise.all([
    prisma.product.findMany({
      where: { kind: "MATERIAL", active: true, ...searchFilter },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.stockMovement.findMany({
      where: {
        product: {
          kind: "MATERIAL",
          ...(query ? searchFilter : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { product: true },
    }),
  ]);

  const low = materials.filter((m) => m.stock <= m.minStock);
  const value = materials.reduce((s, m) => s + m.stock * m.cost, 0);

  return (
    <div>
      <PageHeader
        title="Almacén de materiales"
        description={
          query
            ? `Resultados para “${query}”`
            : "Madera, herrajes, pintura y todo lo que se usa para fabricar"
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/compras/nueva" className="btn btn-secondary">
              Comprar insumos
            </Link>
            <Link href="/materiales/nuevo" className="btn btn-primary">
              Nuevo material
            </Link>
          </div>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por nombre, SKU, categoría…"
          ariaLabel="Buscar materiales"
        />
      </Suspense>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Materiales
          </p>
          <p className="font-display mt-1 text-3xl">{materials.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Bajo mínimo
          </p>
          <p className="font-display mt-1 text-3xl text-amber-800">{low.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Valor al costo
          </p>
          <p className="font-display mt-1 text-2xl">{formatCurrency(value)}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Material</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Mínimo</th>
              <th>Costo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron materiales para “${query}”`
                    : "Aún no hay materiales. Crea madera, tornillos, barniz, etc."}
                </td>
              </tr>
            ) : (
              materials.map((m) => {
                const alert = m.stock <= m.minStock;
                return (
                  <tr key={m.id}>
                    <td className="font-mono text-xs">{m.sku || "—"}</td>
                    <td className="font-medium">{m.name}</td>
                    <td>{m.category}</td>
                    <td className={alert ? "font-semibold text-amber-800" : ""}>
                      {m.stock}
                    </td>
                    <td>{m.unit}</td>
                    <td>{m.minStock}</td>
                    <td>{formatCurrency(m.cost)}</td>
                    <td className="text-right">
                      <Link
                        href={`/materiales/${m.id}`}
                        className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                      >
                        Ajustar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 mb-3 font-display text-xl">Movimientos del almacén</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Material</th>
              <th>Motivo</th>
              <th>Cant</th>
              <th>Saldo</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query ? "Sin movimientos para esta búsqueda" : "Sin movimientos"}
                </td>
              </tr>
            ) : (
              moves.map((mv) => (
                <tr key={mv.id}>
                  <td className="text-xs">{formatDate(mv.createdAt)}</td>
                  <td>{mv.product.name}</td>
                  <td>{mv.reason}</td>
                  <td className={mv.qty < 0 ? "text-rose-700" : "text-emerald-700"}>
                    {mv.qty > 0 ? `+${mv.qty}` : mv.qty}
                  </td>
                  <td>{mv.balance}</td>
                  <td className="text-xs text-[var(--muted)]">{mv.note || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
