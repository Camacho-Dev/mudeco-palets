"use client";

import Link from "next/link";
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { FadeIn } from "@/components/motion";

export function TopCustomersList({ data }: { data: BusinessAnalytics }) {
  return (
    <>
      <FadeIn delay={0.18} className="card p-5">
        <h2 className="font-display mb-1 text-lg">Mejores clientes</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          Por volumen de compra acumulado
        </p>
        <ul className="space-y-3">
          {data.topCustomers.length === 0 ? (
            <li className="py-8 text-center text-sm text-[var(--muted)]">
              Sin datos
            </li>
          ) : (
            data.topCustomers.map((c, i) => {
              const medalClass =
                i === 0
                  ? "bg-gradient-to-br from-[#efd08d] via-brand-gold to-[#a07736] text-[#2c1d14] shadow-[0_2px_10px_rgba(201,161,90,0.4)] font-extrabold"
                  : i === 1
                    ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold"
                    : i === 2
                      ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold"
                      : "bg-[var(--wood-950)] text-[var(--brass)] font-semibold";

              return (
                <li
                  key={c.name}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#fbf7f2] px-3.5 py-3 transition hover:border-brand-gold-strong/50 hover:bg-white hover:shadow-sm"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs shrink-0 ${medalClass}`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--wood-950)]">
                      {c.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {c.count} {c.count === 1 ? "factura" : "facturas"}
                    </p>
                  </div>
                  <p className="font-display text-base font-semibold text-[var(--wood-900)]">
                    {formatCurrency(c.total)}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      </FadeIn>
    </>
  );
}

export function RecentInvoicesTable({ data }: { data: BusinessAnalytics }) {
  return (
    <>
      <FadeIn delay={0.2} className="card overflow-hidden lg:col-span-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-display text-lg">Facturas recientes</h2>
          <Link
            href="/facturas"
            className="text-sm font-medium text-[var(--wood-800)] hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="table-wrap border-0 shadow-none">
          <table className="data">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--muted)]">
                    Sin facturas.{" "}
                    <Link href="/vender" className="underline">
                      Genera la primera
                    </Link>
                  </td>
                </tr>
              ) : (
                data.recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        href={`/facturas/${inv.id}`}
                        className="font-medium text-[var(--wood-800)] hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td>{inv.customer.name}</td>
                    <td>{formatDate(inv.issueDate)}</td>
                    <td>{formatCurrency(inv.total)}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </>
  );
}

export function PaymentMethodsCard({ data }: { data: BusinessAnalytics }) {
  const { kpis } = data;
  return (
    <>
      <FadeIn delay={0.22} className="card p-5 lg:col-span-2">
        <h2 className="font-display mb-1 text-lg">Métodos de pago</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          Distribución del dinero cobrado
        </p>
        {data.paymentMethods.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">
            Aún no hay pagos registrados
          </p>
        ) : (
          <ul className="space-y-3">
            {data.paymentMethods.map((m) => {
              const pct =
                kpis.collectedAll > 0
                  ? Math.round((m.amount / kpis.collectedAll) * 100)
                  : 0;
              return (
                <li key={m.method}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{m.label}</span>
                    <span className="font-medium">
                      {formatCurrency(m.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f0e6db]">
                    <div
                      className="h-full rounded-full bg-[var(--brass)] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[0.65rem] text-[var(--muted)]">
                    {pct}%
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-4 text-center">
          <div>
            <p className="font-display text-lg">{data.statusBreakdown.paid}</p>
            <p className="text-[0.65rem] text-[var(--muted)] uppercase">
              Pagadas
            </p>
          </div>
          <div>
            <p className="font-display text-lg">
              {data.statusBreakdown.partial}
            </p>
            <p className="text-[0.65rem] text-[var(--muted)] uppercase">
              Parcial
            </p>
          </div>
          <div>
            <p className="font-display text-lg">
              {data.statusBreakdown.issued}
            </p>
            <p className="text-[0.65rem] text-[var(--muted)] uppercase">
              Emitidas
            </p>
          </div>
        </div>
      </FadeIn>
    </>
  );
}
