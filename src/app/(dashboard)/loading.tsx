export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-stone-200/80" />
          <div className="h-8 w-64 rounded-lg bg-stone-300/80" />
          <div className="h-4 w-48 rounded bg-stone-200/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-xl bg-stone-200/80" />
          <div className="h-9 w-32 rounded-xl bg-amber-200/70" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/70 bg-white p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded bg-stone-200" />
              <div className="h-7 w-7 rounded-lg bg-stone-100" />
            </div>
            <div className="h-7 w-32 rounded bg-stone-300" />
            <div className="h-3 w-40 rounded bg-stone-100" />
          </div>
        ))}
      </div>

      {/* Main Table or Card Skeleton */}
      <div className="rounded-2xl border border-stone-200/70 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div className="h-5 w-40 rounded bg-stone-300" />
          <div className="h-8 w-60 rounded-xl bg-stone-100" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between gap-4 py-2 border-b border-stone-100/60 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-stone-100 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-44 rounded bg-stone-200" />
                  <div className="h-3 w-28 rounded bg-stone-100" />
                </div>
              </div>
              <div className="h-4 w-20 rounded bg-stone-200" />
              <div className="h-6 w-16 rounded-full bg-stone-100" />
              <div className="h-7 w-20 rounded-lg bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
