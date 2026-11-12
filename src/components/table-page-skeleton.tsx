export function TablePageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-stone-200/80" />
          <div className="h-4 w-72 rounded bg-stone-200/60" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-stone-200/80" />
      </div>

      <div className="card p-4 space-y-3">
        <div className="h-10 w-full max-w-md rounded-xl bg-stone-200/70" />
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-full bg-stone-200/60" />
          <div className="h-7 w-24 rounded-full bg-stone-200/60" />
          <div className="h-7 w-20 rounded-full bg-stone-200/60" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="h-11 bg-stone-100 border-b border-stone-200/70" />
        <div className="divide-y divide-stone-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-44 rounded bg-stone-200/80" />
                <div className="h-3 w-28 rounded bg-stone-200/50" />
              </div>
              <div className="h-6 w-24 rounded-full bg-stone-200/70" />
              <div className="h-4 w-24 rounded bg-stone-200/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

