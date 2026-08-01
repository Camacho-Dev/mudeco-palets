import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getBusinessAnalytics } from "@/lib/analytics";
import { buildDateRange } from "@/lib/date-range";
import { FinanzasView } from "@/components/finanzas-view";
import { DateFilterBar } from "@/components/date-filter";

export default async function FinanzasPage({
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
  const data = await getBusinessAnalytics(range);

  return (
    <div>
      <Suspense fallback={<div className="card mb-6 h-28 animate-pulse" />}>
        <DateFilterBar label="Periodo de finanzas" />
      </Suspense>
      <FinanzasView data={data} />
    </div>
  );
}
