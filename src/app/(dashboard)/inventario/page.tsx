import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import {
  formatCurrency,
  formatDate,
  STOCK_REASON_LABELS,
  STOCK_REASON_COLORS,
} from "@/lib/format";
import { ExternalLink, Layers, ArrowUpRight } from "lucide-react";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
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

  const [products, moves] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED", ...searchFilter },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.stockMovement.findMany({
      where: {
        product: {
          kind: "FINISHED",
          ...(query ? searchFilter : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 35,
      include: { product: true },
    }),
  ]);

  const low = products.filter(
    (p) => p.stock <= p.minStock && p.sku !== "CUS-001",
  );
  const outOfStock = products.filter((p) => p.stock <= 0 && p.sku !== "CUS-001");
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const inventoryRetail = products.reduce((s, p) => s + p.stock * p.price, 0);
  const potentialMargin = inventoryRetail - inventoryValue;
  const potentialMarginPct =
    inventoryRetail > 0 ? (potentialMargin / inventoryRetail) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Inventario de Muebles"
        description={
          query
            ? `Resultados para “${query}”`
            : "Stock de muebles terminados listos para venta y vitrina online"
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/materiales" className="btn btn-secondary">
              Ver materiales
            </Link>
            <Link href="/productos/nuevo" className="btn btn-primary">
              Nuevo mueble
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
          ariaLabel="Buscar en inventario"
        />
      </Suspense>

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mr-1">
          Categoría:
        </span>
        <Link
          href="/inventario"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !query
              ? "bg-[var(--wood-950)] text-white shadow-xs"
              : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border border-stone-200"
          }`}
        >
          Todas
        </Link>
        {Array.from(new Set(products.map((p) => p.category)))
          .sort((a, b) => a.localeCompare(b, "es"))
          .map((cat) => {
            const active = query.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={`/inventario?q=${encodeURIComponent(cat)}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-[var(--wood-950)] text-white shadow-xs font-semibold"
                    : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {cat}
              </Link>
            );
          })}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Muebles en catálogo
          </p>
          <p className="font-display mt-1 text-3xl text-[var(--wood-950)]">
            {products.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Activos en sistema ERP y tienda
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Stock crítico / Bajo
          </p>
          <p
            className={`font-display mt-1 text-3xl font-bold ${
              low.length > 0 ? "text-amber-800" : "text-emerald-800"
            }`}
          >
            {low.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {outOfStock.length} agotados en cero
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Valoración al costo
          </p>
          <p className="font-display mt-1 text-2xl text-[var(--wood-950)]">
            {formatCurrency(inventoryValue)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Costo de adquisición / fabricación
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Valor precio venta
          </p>
          <p className="font-display mt-1 text-2xl text-[var(--brass)] font-semibold">
            {formatCurrency(inventoryRetail)}
          </p>
          <p className="mt-1 text-xs text-emerald-800 font-medium">
            Margen pot: {potentialMarginPct.toFixed(0)}% ({formatCurrency(potentialMargin)})
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Disponibilidad</th>
              <th>Mínimo</th>
              <th>Costo</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron ítems para “${query}”`
                    : "No hay muebles en inventario"}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isOutOfStock = p.stock <= 0 && p.sku !== "CUS-001";
                const isLowStock =
                  p.stock > 0 && p.stock <= p.minStock && p.sku !== "CUS-001";

                return (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-[var(--muted)]">
                      {p.sku || "—"}
                    </td>
                    <td>
                      <Link
                        href={`/productos/${p.id}`}
                        className="font-semibold text-[var(--wood-950)] hover:underline block"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td>
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                        {p.category}
                      </span>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Agotado ({p.stock})
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Bajo ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {p.sku === "CUS-001" ? "A medida" : `${p.stock} unid.`}
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-[var(--muted)]">{p.minStock}</td>
                    <td className="text-xs text-[var(--muted)]">{formatCurrency(p.cost)}</td>
                    <td className="font-semibold text-[var(--wood-900)]">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/producto/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[#fbf7f2] px-2 py-1 text-xs text-[var(--wood-800)] hover:border-[#b0894f] hover:bg-white"
                          title="Ver cómo se ve en la tienda online"
                        >
                          <span>Ver web</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                        <Link
                          href={`/productos/${p.id}`}
                          className="rounded border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium text-[var(--wood-800)] hover:border-[var(--wood-700)] hover:bg-[#fbf7f2]"
                        >
                          Ajustar
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

      <div className="mt-10 mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--wood-950)]">
            Kardex Reciente de Movimientos
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Historial de entradas, salidas por ventas, producción en taller y ajustes
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Motivo & Origen</th>
              <th>Cantidad</th>
              <th>Saldo posterior</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)] py-8">
                  {query ? "Sin movimientos para esta búsqueda" : "Sin movimientos de stock registrados aún"}
                </td>
              </tr>
            ) : (
              moves.map((m) => {
                const label = STOCK_REASON_LABELS[m.reason] || m.reason;
                const badgeColor =
                  STOCK_REASON_COLORS[m.reason] || "bg-stone-100 text-stone-700 border-stone-200";

                return (
                  <tr key={m.id} className="hover:bg-[#fbf7f2]/50">
                    <td className="text-xs text-[var(--muted)] whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/productos/${m.product.id}`}
                        className="font-medium text-[var(--wood-950)] hover:underline"
                      >
                        {m.product.name}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${badgeColor}`}
                        >
                          {label}
                        </span>
                        {m.note ? (
                          <p className="mt-0.5 text-xs text-[var(--muted)] italic">
                            {m.note}
                          </p>
                        ) : null}
                        {m.refType === "Invoice" && m.refId ? (
                          <Link
                            href={`/facturas/${m.refId}`}
                            className="inline-flex items-center gap-0.5 text-xs text-[#b0894f] hover:underline mt-0.5 font-medium"
                          >
                            <span>Ver factura</span>
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </Link>
                        ) : m.refType === "WorkOrder" ? (
                          <Link
                            href="/fabricacion"
                            className="inline-flex items-center gap-0.5 text-xs text-[#b0894f] hover:underline mt-0.5 font-medium"
                          >
                            <span>Ver orden taller</span>
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </Link>
                        ) : m.refType === "Purchase" && m.refId ? (
                          <Link
                            href={`/compras/${m.refId}`}
                            className="inline-flex items-center gap-0.5 text-xs text-[#b0894f] hover:underline mt-0.5 font-medium"
                          >
                            <span>Ver compra</span>
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </Link>
                        ) : m.refType === "CreditNote" ? (
                          <Link
                            href="/notas-credito"
                            className="inline-flex items-center gap-0.5 text-xs text-[#b0894f] hover:underline mt-0.5 font-medium"
                          >
                            <span>Ver nota de crédito</span>
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                    <td
                      className={`font-semibold whitespace-nowrap ${
                        m.qty < 0 ? "text-rose-700 font-bold" : "text-emerald-700"
                      }`}
                    >
                      {m.qty > 0 ? `+${m.qty}` : m.qty} {m.product.unit || "unid."}
                    </td>
                    <td className="font-bold text-[var(--wood-950)]">
                      {m.balance}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
