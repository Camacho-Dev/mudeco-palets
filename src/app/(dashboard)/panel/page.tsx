import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { getBusinessAnalytics } from "@/lib/analytics";
import { buildDateRange } from "@/lib/date-range";
import { DashboardView } from "@/components/dashboard-view";
import { DateFilterBar } from "@/components/date-filter";
import { DashboardSearch } from "@/components/dashboard-search";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    month?: string;
    from?: string;
    to?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const range = buildDateRange(params);
  const data = await getBusinessAnalytics(range);

  return (
    <div className="space-y-6">
      <DashboardSearch />
      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo del panel" />
      </Suspense>
      <DashboardView data={data} />
    </div>
  );
}
