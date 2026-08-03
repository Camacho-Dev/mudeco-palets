import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function NotasCreditoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const rows = await prisma.creditNote.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { number: { contains: query, mode: "insensitive" } },
            { reason: { contains: query, mode: "insensitive" } },
            {
              invoice: {
                OR: [
                  { number: { contains: query, mode: "insensitive" } },
                  { ncf: { contains: query, mode: "insensitive" } },
                ],
              },
            },
            {
              customer: {
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
    include: { customer: true, invoice: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Notas de crédito"
        description={
          query
            ? `Resultados para “${query}”`
            : "Devoluciones y ajustes sobre facturas"
        }
        action={
          <Link href="/notas-credito/nueva" className="btn btn-primary">
            Nueva NC
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por NC, factura, cliente o motivo…"
          ariaLabel="Buscar notas de crédito"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron notas para “${query}”`
                    : "No hay notas de crédito"}
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr key={n.id}>
                  <td>{n.number}</td>
                  <td>
                    <Link href={`/facturas/${n.invoiceId}`} className="underline">
                      {n.invoice.number}
                    </Link>
                  </td>
                  <td>{n.customer.name}</td>
                  <td>{formatDate(n.issueDate)}</td>
                  <td>{formatCurrency(n.total)}</td>
                  <td className="max-w-xs truncate text-sm">{n.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
