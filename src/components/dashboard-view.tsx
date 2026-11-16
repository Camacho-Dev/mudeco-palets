"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { FadeIn } from "@/components/motion";
import { DashboardAlerts } from "./dashboard-view-alerts";
import { WebChannelPanel } from "./dashboard-view-web-channel";
import { MoneySummary } from "./dashboard-view-money";
import { SalesTrendCharts, TopProductsChart } from "./dashboard-view-charts";
import {
  PaymentMethodsCard,
  RecentInvoicesTable,
  TopCustomersList,
} from "./dashboard-view-lists";

export function DashboardView({ data }: { data: BusinessAnalytics }) {
  const { company } = data;

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
          <Link href="/finanzas" className="btn btn-secondary">
            <Calculator className="h-4 w-4" />
            Ver finanzas
          </Link>
        </div>
      </FadeIn>

      <DashboardAlerts data={data} />

      <WebChannelPanel data={data} />

      <MoneySummary data={data} />

      <SalesTrendCharts data={data} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <TopProductsChart data={data} />

        <TopCustomersList data={data} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <RecentInvoicesTable data={data} />

        <PaymentMethodsCard data={data} />
      </div>
    </div>
  );
}
