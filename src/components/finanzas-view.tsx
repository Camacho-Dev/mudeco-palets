"use client";

import Link from "next/link";
import {
  Calculator,
  PiggyBank,
  TrendingUp,
  Wallet,
  Boxes,
  Receipt,
  Percent,
  ArrowLeft,
} from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import {
  AnimatedNumber,
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/motion";

export function FinanzasView({ data }: { data: BusinessAnalytics }) {
  const { kpis, company } = data;

  const blocks = [
    {
      title: "Ventas",
      icon: TrendingUp,
      rows: [
        { label: "Este periodo", value: kpis.salesMonth },
        { label: "Este año", value: kpis.salesYear },
        { label: "Histórico total", value: kpis.salesAll },
        { label: "ITBIS del periodo", value: kpis.taxMonth },
        { label: "ITBIS acumulado", value: kpis.taxAll },
        { label: "Ticket promedio", value: kpis.avgTicket },
      ],
    },
    {
      title: "Cobros",
      icon: PiggyBank,
      rows: [
        { label: "Cobrado del periodo", value: kpis.collectedMonth },
        { label: "Cobrado este año", value: kpis.collectedYear },
        { label: "Cobrado histórico", value: kpis.collectedAll },
        { label: "Por cobrar (cartera)", value: kpis.receivables },
        {
          label: "Facturas abiertas",
          value: kpis.openCount,
          currency: false,
        },
      ],
    },
    {
      title: "Costos y margen",
      icon: Percent,
      rows: [
        { label: "Costo vendido (periodo)", value: kpis.costMonth },
        { label: "Costo vendido (total)", value: kpis.costAll },
        { label: "Margen estimado (periodo)", value: kpis.marginMonth },
        { label: "Margen estimado (total)", value: kpis.marginAll },
        {
          label: "Margen %",
          value: kpis.marginPct,
          suffix: "%",
          currency: false,
        },
      ],
    },
    {
      title: "Inventario",
      icon: Boxes,
      rows: [
        { label: "Valor al costo", value: kpis.inventoryValue },
        { label: "Valor a precio venta", value: kpis.inventoryRetail },
        {
          label: "Muebles activos",
          value: kpis.productCount,
          currency: false,
        },
        {
          label: "Alertas de stock",
          value: kpis.lowStockCount,
          currency: false,
        },
      ],
    },
  ];

  const resumen = [
    {
      label: "Dinero entrado",
      value: kpis.collectedAll,
      hint: "Todo lo cobrado históricamente",
      icon: PiggyBank,
    },
    {
      label: "Dinero por entrar",
      value: kpis.receivables,
      hint: "Saldo pendiente de clientes",
      icon: Wallet,
    },
    {
      label: "Valor en showroom",
      value: kpis.inventoryValue,
      hint: "Inventario valorizado al costo",
      icon: Receipt,
    },
    {
      label: "Utilidad estimada",
      value: kpis.marginAll,
      hint: "Ventas netas − costo de muebles",
      icon: Calculator,
    },
  ];

  return (
    <div className="pb-10">
      <FadeIn>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--wood-800)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brass)] uppercase">
          Finanzas
        </p>
        <h1 className="font-display mt-1 text-3xl text-[var(--wood-950)] md:text-4xl">
          Cálculo del dinero
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {company?.name || "Mudeco Palets"}
          {data.period?.label ? ` · ${data.period.label}` : ""} · ventas, cobros,
          costos e inventario
        </p>
      </FadeIn>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumen.map((r) => (
          <StaggerItem key={r.label}>
            <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
                  {r.label}
                </p>
                <div className="rounded-lg bg-[#f3ebe3] p-2 text-[var(--wood-800)]">
                  <r.icon className="h-4 w-4" />
                </div>
              </div>
              <AnimatedNumber
                value={r.value}
                className="font-display text-2xl"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">{r.hint}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {blocks.map((block, i) => (
          <FadeIn key={block.title} delay={0.1 + i * 0.05}>
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[#fbf7f2] px-5 py-4">
                <block.icon className="h-4 w-4 text-[var(--brass)]" />
                <h2 className="font-display text-lg">{block.title}</h2>
              </div>
              <ul className="divide-y divide-[var(--border)]">
                {block.rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <span className="text-sm text-[var(--muted)]">
                      {row.label}
                    </span>
                    <span className="font-display text-base text-[var(--wood-950)]">
                      {"currency" in row && row.currency === false ? (
                        <>
                          {row.value}
                          {"suffix" in row && row.suffix ? row.suffix : ""}
                        </>
                      ) : (
                        <AnimatedNumber value={row.value as number} />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3} className="mt-8">
        <div className="card p-5">
          <h2 className="font-display mb-3 text-lg">Aging cuentas por cobrar</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "0–30 días", value: data.aging.d0_30 },
              { label: "31–60 días", value: data.aging.d31_60 },
              { label: "61–90 días", value: data.aging.d61_90 },
              { label: "+90 días", value: data.aging.d90plus },
            ].map((b) => (
              <div key={b.label} className="rounded-lg bg-[#fbf7f2] p-3">
                <p className="text-xs text-[var(--muted)]">{b.label}</p>
                <p className="font-display text-lg">
                  {formatCurrency(b.value)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {data.aging.count} facturas abiertas · según fecha de vencimiento o
            emisión
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.35} className="mt-8">
        <div
          className="rounded-2xl border border-[#5c4334] p-6 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #3d2a1f 0%, #5c4334 100%)",
            color: "#faf6f1",
          }}
        >
          <h2 className="font-display text-xl text-[#faf6f1]">
            Fórmula rápida
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#faf6f1]/80">
            <strong className="text-[#b0894f]">Utilidad estimada</strong> =
            Ventas totales − ITBIS − Costo de muebles vendidos. El inventario se
            valora aparte (al costo y a precio de venta). Lo por cobrar es dinero
            ya facturado que aún no entra a caja.
          </p>
          <p className="mt-4 font-display text-2xl text-[#faf6f1]">
            {formatCurrency(kpis.marginAll)}
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
