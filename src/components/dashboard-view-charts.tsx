"use client";

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
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/motion";

export const CHART = {
  sales: "#0f172a",
  collected: "#d97706",
  grid: "#e2e8f0",
  muted: "#64748b",
};

export const PIE_COLORS = [
  "#0f172a",
  "#d97706",
  "#2563eb",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
];

export function MoneyTooltip({
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
export function SalesTrendCharts({ data }: { data: BusinessAnalytics }) {
  return (
    <>
      <div className="mb-8 grid gap-6 xl:grid-cols-5">
        <FadeIn delay={0.12} className="card p-5 xl:col-span-3">
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
                  <linearGradient
                    id="collectedFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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

        <FadeIn delay={0.14} className="card p-5 xl:col-span-2">
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
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
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
    </>
  );
}

export function TopProductsChart({ data }: { data: BusinessAnalytics }) {
  return (
    <>
      <FadeIn delay={0.16} className="card p-5">
        <h2 className="font-display mb-1 text-lg">Top muebles</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          Mayor facturación acumulada
        </p>
        {data.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            Sin datos
          </p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid
                  stroke={CHART.grid}
                  strokeDasharray="3 3"
                  horizontal={false}
                />
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
    </>
  );
}
