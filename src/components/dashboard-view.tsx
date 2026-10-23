"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  Calculator,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import {
  AnimatedNumber,
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/motion";

const CHART = {
  sales: "#5c4334",
  collected: "#b0894f",
  grid: "#e4d8cb",
  muted: "#7a6a5c",
};

const PIE_COLORS = ["#2a1f18", "#5c4334", "#b0894f", "#8a6a3a", "#c4a574", "#3d2e24"];

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-[var(--wood-900)]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export function DashboardView({ data }: { data: BusinessAnalytics }) {
  const { kpis, company } = data;
  const moneyCards = [
    {
      label: "Ventas del periodo",
      value: kpis.salesMonth,
      hint: `${kpis.invoiceCountMonth} facturas · ticket ${formatCurrency(kpis.avgTicket)}`,
      icon: TrendingUp,
      tone: "accent" as const,
    },
    {
      label: "Cobrado del periodo",
      value: kpis.collectedMonth,
      hint: `Año: ${formatCurrency(kpis.collectedYear)}`,
      icon: Banknote,
      tone: "default" as const,
    },
    {
      label: "Por cobrar",
      value: kpis.receivables,
      hint: `${kpis.openCount} facturas abiertas`,
      icon: Wallet,
      tone: "warn" as const,
    },
    {
      label: "Margen del periodo",
      value: kpis.marginMonth,
      hint: `${kpis.marginPct}% margen estimado`,
      icon: Percent,
      tone: "default" as const,
    },
  ];

  const moneyTotals = [
    {
      label: "Ventas totales",
      value: kpis.salesAll,
      icon: Calculator,
      sub: `ITBIS acumulado ${formatCurrency(kpis.taxAll)}`,
    },
    {
      label: "Dinero cobrado",
      value: kpis.collectedAll,
      icon: PiggyBank,
      sub: `Este año ${formatCurrency(kpis.collectedYear)}`,
    },
    {
      label: "Costo de lo vendido",
      value: kpis.costAll,
      icon: Boxes,
      sub: `Mes ${formatCurrency(kpis.costMonth)}`,
    },
    {
      label: "Inventario al costo",
      value: kpis.inventoryValue,
      icon: Receipt,
      sub: `A precio venta ${formatCurrency(kpis.inventoryRetail)}`,
    },
  ];

  return (
    <div className="pb-8">
      <FadeIn>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brass)] uppercase">
              Panel ejecutivo
            </p>
            <h1 className="font-display mt-1 text-3xl text-[var(--wood-950)] md:text-4xl">
              {company?.name || "Mudeco Palets"}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Estadísticas de venta
              {data.period?.label ? ` · ${data.period.label}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/finanzas" className="btn btn-secondary">
              <Calculator className="h-4 w-4" />
              Ver finanzas
            </Link>
            <Link href="/vender" className="btn btn-accent btn-lg">
              <Zap className="h-5 w-5" />
              Generar factura
            </Link>
          </div>
        </div>
      </FadeIn>

      {kpis.lowStockCount > 0 ? (
        <FadeIn delay={0.05}>
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                Stock bajo en {kpis.lowStockCount} mueble(s)
              </p>
              <p className="text-amber-800/80">
                {kpis.lowStockNames.join(", ")}
                {kpis.lowStockCount > 4 ? "…" : ""}
                {" · "}
                <Link href="/inventario" className="underline">
                  Ver inventario
                </Link>
              </p>
            </div>
          </div>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.06}>
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brass)] uppercase">
                Tienda web
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Lo que llega desde la web al panel
              </p>
            </div>
            <Link href="/pedidos-web" className="btn btn-secondary text-sm">
              Ver pedidos web
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-[#fbf7f2] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Pendientes</p>
              <p className="text-2xl font-semibold text-[var(--wood-950)]">
                {kpis.webPendingCount}
              </p>
            </div>
            <div className="rounded-lg bg-[#fbf7f2] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Reparaciones</p>
              <p className="text-2xl font-semibold text-[var(--wood-950)]">
                {kpis.webRepairsCount}
              </p>
            </div>
            <div className="rounded-lg bg-[#fbf7f2] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Consultas</p>
              <p className="text-2xl font-semibold text-[var(--wood-950)]">
                {kpis.webContactsCount}
              </p>
            </div>
            <div className="rounded-lg bg-[#fbf7f2] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Ventas web</p>
              <p className="text-2xl font-semibold text-[var(--wood-950)]">
                {kpis.webSalesCount}
              </p>
            </div>
          </div>
          {data.recentWebOrders?.length ? (
            <ul className="mt-4 divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {data.recentWebOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <Link
                    href={`/pedidos-web/${o.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {o.number}
                  </Link>
                  <span className="text-[var(--muted)]">{o.customerName}</span>
                  <span className="text-[var(--muted)]">
                    {formatCurrency(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </FadeIn>

      <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {moneyCards.map((c) => (
          <StaggerItem key={c.label}>
            <div
              className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                c.tone === "accent"
                  ? "border-[#5c4334] text-[#faf6f1]"
                  : c.tone === "warn"
                    ? "card border-amber-200/80"
                    : "card"
              }`}
              style={
                c.tone === "accent"
                  ? {
                      background:
                        "linear-gradient(135deg, #3d2a1f 0%, #5c4334 100%)",
                    }
                  : undefined
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p
                  className={`text-xs font-semibold tracking-wide uppercase ${
                    c.tone === "accent" ? "text-white/55" : "text-[var(--muted)]"
                  }`}
                >
                  {c.label}
                </p>
                <div
                  className={`rounded-lg p-2 ${
                    c.tone === "accent"
                      ? "bg-white/10 text-[var(--brass)]"
                      : "bg-[#f3ebe3] text-[var(--wood-800)]"
                  }`}
                >
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
              <AnimatedNumber
                value={c.value}
                className={`font-display text-2xl ${
                  c.tone === "accent" ? "text-white" : "text-[var(--wood-950)]"
                }`}
              />
              <p
                className={`mt-2 text-xs ${
                  c.tone === "accent" ? "text-white/50" : "text-[var(--muted)]"
                }`}
              >
                {c.hint}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn delay={0.15} className="mb-8">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <h2 className="font-display text-lg text-[var(--wood-900)]">
                Dinero de la empresa
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Totales históricos · costos · inventario
              </p>
            </div>
            <Link
              href="/finanzas"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--wood-800)] hover:underline"
            >
              Detalle
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
            {moneyTotals.map((t) => (
              <div key={t.label} className="bg-[var(--surface)] p-5">
                <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
                  <t.icon className="h-4 w-4" />
                  <span className="text-[0.65rem] font-semibold tracking-wide uppercase">
                    {t.label}
                  </span>
                </div>
                <AnimatedNumber
                  value={t.value}
                  className="font-display text-xl text-[var(--wood-950)]"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="mb-8 grid gap-6 xl:grid-cols-5">
        <FadeIn delay={0.2} className="card p-5 xl:col-span-3">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg">Ventas vs cobros</h2>
              <p className="text-xs text-[var(--muted)]">Últimos 6 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c4334" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#5c4334" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#5c4334" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a15a" stopOpacity={0.55} />
                    <stop offset="60%" stopColor="#b0894f" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#b0894f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART.muted, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                />
                <Tooltip content={<MoneyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Ventas"
                  stroke={CHART.sales}
                  fill="url(#salesFill)"
                  strokeWidth={2.5}
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Cobrado"
                  stroke={CHART.collected}
                  fill="url(#collectedFill)"
                  strokeWidth={2.5}
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        <FadeIn delay={0.25} className="card p-5 xl:col-span-2">
          <h2 className="font-display mb-1 text-lg">Por categoría</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Ingresos por tipo de mueble
          </p>
          {data.categorySales.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              Aún no hay ventas
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categorySales}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.categorySales.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 space-y-1.5">
            {data.categorySales.slice(0, 4).map((c, i) => (
              <li
                key={c.category}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {c.category}
                </span>
                <span className="font-medium">{formatCurrency(c.amount)}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.28} className="card p-5">
          <h2 className="font-display mb-1 text-lg">Top muebles</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Mayor facturación acumulada
          </p>
          {data.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">Sin datos</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topProducts}
                  layout="vertical"
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<MoneyTooltip />} />
                  <Bar
                    dataKey="revenue"
                    name="Ingresos"
                    fill={CHART.collected}
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.32} className="card p-5">
          <h2 className="font-display mb-1 text-lg">Mejores clientes</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">Por volumen de compra acumulado</p>
          <ul className="space-y-3">
            {data.topCustomers.length === 0 ? (
              <li className="py-8 text-center text-sm text-[var(--muted)]">
                Sin datos
              </li>
            ) : (
              data.topCustomers.map((c, i) => {
                const medalClass =
                  i === 0
                    ? "bg-gradient-to-br from-[#efd08d] via-[#c9a15a] to-[#a07736] text-[#2c1d14] shadow-[0_2px_10px_rgba(201,161,90,0.4)] font-extrabold"
                    : i === 1
                      ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold"
                      : i === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold"
                        : "bg-[var(--wood-950)] text-[var(--brass)] font-semibold";

                return (
                  <li
                    key={c.name}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#fbf7f2] px-3.5 py-3 transition hover:border-[#b0894f]/50 hover:bg-white hover:shadow-sm"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs shrink-0 ${medalClass}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--wood-950)]">{c.name}</p>
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

      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <FadeIn delay={0.35} className="card overflow-hidden lg:col-span-3">
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

        <FadeIn delay={0.4} className="card p-5 lg:col-span-2">
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
      </div>
    </div>
  );
}
