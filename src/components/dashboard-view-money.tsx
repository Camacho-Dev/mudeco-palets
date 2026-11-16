"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  Calculator,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import {
  AnimatedNumber,
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/motion";

export function MoneySummary({ data }: { data: BusinessAnalytics }) {
  const { kpis } = data;
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
    <>
      <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {moneyCards.map((c) => (
          <StaggerItem key={c.label}>
            <div
              className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                c.tone === "accent"
                  ? "border-brand-brown-light text-brand-cream-warm"
                  : c.tone === "warn"
                    ? "card border-amber-200/80"
                    : "card"
              }`}
              style={
                c.tone === "accent"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-brand-brown) 0%, var(--color-brand-brown-light) 100%)",
                    }
                  : undefined
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p
                  className={`text-xs font-semibold tracking-wide uppercase ${
                    c.tone === "accent"
                      ? "text-white/55"
                      : "text-[var(--muted)]"
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

      <FadeIn delay={0.1} className="mb-8">
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
    </>
  );
}
