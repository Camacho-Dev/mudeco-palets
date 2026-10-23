import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const quotes = await prisma.quote.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { number: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
            {
              customer: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { taxId: { contains: query, mode: "insensitive" } },
                  { phone: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description={
          query
            ? `Resultados para “${query}”`
            : "Presupuestos convertibles a factura"
        }
        action={
          <Link href="/cotizaciones/nueva" className="btn btn-primary">
            Nueva cotización
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por número, cliente, RNC o notas…"
          ariaLabel="Buscar cotizaciones"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron cotizaciones para “${query}”`
                    : "No hay cotizaciones todavía"}
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <Link
                      href={`/cotizaciones/${quote.id}`}
                      className="font-medium font-mono text-xs text-[var(--wood-900)] hover:underline"
                    >
                      {quote.number}
                    </Link>
                  </td>
                  <td className="font-medium text-[var(--wood-950)]">{quote.customer.name}</td>
                  <td>
                    {quote.source === "WEB" ? (
                      <span className="rounded-full bg-[#b0894f]/20 px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--wood-800)] uppercase">
                        Web
                      </span>
                    ) : (
                      <span className="text-[var(--muted)] text-xs">POS</span>
                    )}
                  </td>
                  <td className="text-xs text-[var(--muted)]">{formatDate(quote.issueDate)}</td>
                  <td>
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="text-right font-mono font-bold text-xs text-[var(--wood-950)]">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/cotizaciones/${quote.id}`}
                      className="text-xs font-semibold text-[var(--wood-800)] hover:underline"
                    >
                      Ver
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
