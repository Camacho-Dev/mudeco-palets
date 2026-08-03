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
                  <td>
                    <Link href={`/compras/${p.id}`} className="underline">
                      {p.number}
                    </Link>
                  </td>
                  <td>{p.supplier.name}</td>
                  <td>{formatDate(p.orderedAt)}</td>
                  <td>{p.status}</td>
                  <td>{formatCurrency(p.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
