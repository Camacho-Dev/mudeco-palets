import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { DateFilterBar } from "@/components/date-filter";
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
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const range = buildDateRange(params);

  const payments = await prisma.payment.findMany({
    where:
      range.from && range.to
        ? { paidAt: { gte: range.from, lte: range.to } }
        : undefined,
    orderBy: { paidAt: "desc" },
    take: 200,
    include: {
      invoice: {
        include: { customer: true },
      },
    },
  });

  const openInvoices = await prisma.invoice.findMany({
    where: { status: { in: ["ISSUED", "PARTIAL"] } },
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
        description={`Historial guardado · ${range.label}`}
      />

      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo de cobros" />
      </Suspense>

      <div className="card mb-6 p-4">
        <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          Cobrado en el periodo
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
                  Nada pendiente
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
        Historial del periodo
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
                  Sin pagos en este periodo
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.paidAt)}</td>
                  <td>
                    <Link
                      href={`/facturas/${p.invoiceId}`}
                      className="font-medium text-[var(--wood-800)] hover:underline"
                    >
                      {p.invoice.number}
                    </Link>
                  </td>
                  <td>{p.invoice.customer.name}</td>
                  <td>{PAYMENT_METHOD_LABELS[p.method] || p.method}</td>
                  <td>{formatCurrency(p.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
