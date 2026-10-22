import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DateFilterBar } from "@/components/date-filter";
import { InvoiceSearchBar } from "@/components/invoice-search";
import { buildDateRange } from "@/lib/date-range";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    month?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const { status } = params;
  const query = (params.q || "").trim();
  const range = buildDateRange(params);

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status } : {}),
      // Con búsqueda, no limitamos por periodo para encontrar cualquier factura
      ...(!query && range.from && range.to
        ? { issueDate: { gte: range.from, lte: range.to } }
        : {}),
      ...(query
        ? {
            OR: [
              { id: { contains: query, mode: "insensitive" } },
              { number: { contains: query, mode: "insensitive" } },
              { ncf: { contains: query, mode: "insensitive" } },
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
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      payments: true,
    },
    take: query ? 100 : undefined,
  });

  const filters = [
    { value: "", label: "Todas" },
    { value: "DRAFT", label: "Borrador" },
    { value: "ISSUED", label: "Emitida" },
    { value: "PARTIAL", label: "Parcial" },
    { value: "PAID", label: "Pagada" },
    { value: "VOIDED", label: "Anulada" },
  ];

  function statusHref(value: string) {
    const q = new URLSearchParams();
    if (value) q.set("status", value);
    if (params.kind) q.set("kind", params.kind);
    if (params.month) q.set("month", params.month);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    if (query) q.set("q", query);
    const s = q.toString();
    return s ? `/facturas?${s}` : "/facturas";
  }

  return (
    <div>
      <PageHeader
        title="Facturas"
        description={
          query
            ? `Resultados para “${query}”`
            : `Historial guardado · ${range.label}`
        }
        action={{ href: "/vender", label: "Generar factura" }}
      />

      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo de facturas" />
      </Suspense>

      <Suspense fallback={<div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />}>
        <InvoiceSearchBar />
      </Suspense>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status || "") === f.value;
          return (
            <Link
              key={f.value || "all"}
              href={statusHref(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active
                  ? "bg-[#3d2a1f] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[#fbf7f2]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron facturas para “${query}”`
                    : "No hay facturas en este periodo"}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-medium">
                    <div>{inv.number}</div>
                    {inv.ncf ? (
                      <div className="text-xs text-[var(--muted)]">{inv.ncf}</div>
                    ) : null}
                  </td>
                  <td>{inv.customer.name}</td>
                  <td>
                    {inv.source === "WEB" ? (
                      <span className="rounded-full bg-[#b0894f]/20 px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--wood-800)] uppercase">
                        Web
                      </span>
                    ) : (
                      <span className="text-[var(--muted)]">POS</span>
                    )}
                  </td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/facturas/${inv.id}`}
                      className="text-sm font-medium text-[var(--wood-800)] hover:underline"
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
