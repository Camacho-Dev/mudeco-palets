import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const rows = await prisma.purchase.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { number: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            {
              supplier: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { taxId: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { supplier: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Compras"
        description={
          query
            ? `Resultados para “${query}”`
            : "Órdenes de compra e ingresos de stock"
        }
        action={
          <Link href="/compras/nueva" className="btn btn-primary">
            Nueva compra
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por número, proveedor, estado o notas…"
          ariaLabel="Buscar compras"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron compras para “${query}”`
                    : "No hay compras"}
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs font-semibold text-[var(--wood-900)]">
                    <Link href={`/compras/${p.id}`} className="hover:underline">
                      {p.number}
                    </Link>
                  </td>
                  <td className="font-medium">{p.supplier.name}</td>
                  <td className="text-xs text-[var(--muted)]">{formatDate(p.orderedAt)}</td>
                  <td>
                    {p.status === "RECEIVED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Recibida
                      </span>
                    ) : p.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Cancelada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Ordenada
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-[var(--wood-950)]">{formatCurrency(p.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
