import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { DateFilterBar } from "@/components/date-filter";
import { ListSearchBar } from "@/components/invoice-search";
import { buildDateRange } from "@/lib/date-range";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    month?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const query = (params.q || "").trim();
  const range = buildDateRange(params);

  const customerOr = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { taxId: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const payments = await prisma.payment.findMany({
    where: {
      ...(!query && range.from && range.to
        ? { paidAt: { gte: range.from, lte: range.to } }
        : {}),
      ...(query
        ? {
            OR: [
              { id: { contains: query, mode: "insensitive" } },
              { notes: { contains: query, mode: "insensitive" } },
              { method: { contains: query, mode: "insensitive" } },
              {
                invoice: {
                  OR: [
                    { number: { contains: query, mode: "insensitive" } },
                    { ncf: { contains: query, mode: "insensitive" } },
                    { customer: customerOr },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { paidAt: "desc" },
    take: 200,
    include: {
      invoice: {
        include: { customer: true },
      },
    },
  });

  const openInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["ISSUED", "PARTIAL"] },
      ...(query
        ? {
            OR: [
              { id: { contains: query, mode: "insensitive" } },
              { number: { contains: query, mode: "insensitive" } },
              { ncf: { contains: query, mode: "insensitive" } },
              { customer: customerOr },
            ],
          }
        : {}),
    },
    orderBy: { issueDate: "desc" },
    include: {
      customer: true,
      payments: true,
    },
  });

  const periodTotal = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Pagos"
        description={
          query
            ? `Resultados para “${query}”`
            : `Historial guardado · ${range.label}`
        }
      />

      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo de cobros" />
      </Suspense>

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por factura, cliente, RNC, método o notas…"
          ariaLabel="Buscar pagos"
        />
      </Suspense>

      <div className="card mb-6 p-4">
        <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          {query ? "Total encontrado" : "Cobrado en el periodo"}
        </p>
        <p className="font-display mt-1 text-2xl">{formatCurrency(periodTotal)}</p>
        <p className="text-xs text-[var(--muted)]">
          {payments.length} pago{payments.length === 1 ? "" : "s"}
        </p>
      </div>

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
        Por cobrar
      </h2>
      <div className="table-wrap mb-8">
        <table className="data">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {openInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query ? `Nada pendiente para “${query}”` : "Nada pendiente"}
                </td>
              </tr>
            ) : (
              openInvoices.map((inv) => {
                const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                const balance = Math.round((inv.total - paid) * 100) / 100;
                return (
                  <tr key={inv.id}>
                    <td className="font-medium">{inv.number}</td>
                    <td>{inv.customer.name}</td>
                    <td>{formatCurrency(inv.total)}</td>
                    <td>{formatCurrency(paid)}</td>
                    <td className="font-medium text-amber-700">
                      {formatCurrency(balance)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/facturas/${inv.id}`}
                        className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                      >
                        Cobrar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
        {query ? "Pagos encontrados" : "Historial del periodo"}
      </h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron pagos para “${query}”`
                    : "Sin pagos en este periodo"}
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const badgeColor =
                  p.method === "CASH"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : p.method === "TRANSFER"
                      ? "bg-sky-50 text-sky-800 border-sky-200"
                      : p.method === "CARD"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : p.method === "CHECK"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-stone-50 text-stone-700 border-stone-200";

                return (
                  <tr key={p.id}>
                    <td className="text-xs text-[var(--muted)]">{formatDate(p.paidAt)}</td>
                    <td className="font-mono text-xs font-semibold">
                      <Link
                        href={`/facturas/${p.invoiceId}`}
                        className="text-[var(--wood-900)] hover:underline"
                      >
                        {p.invoice.number}
                      </Link>
                    </td>
                    <td className="font-medium text-[var(--wood-950)]">{p.invoice.customer.name}</td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${badgeColor}`}
                      >
                        {PAYMENT_METHOD_LABELS[p.method] || p.method}
                      </span>
                    </td>
                    <td className="font-bold text-[var(--wood-950)]">{formatCurrency(p.amount)}</td>
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
