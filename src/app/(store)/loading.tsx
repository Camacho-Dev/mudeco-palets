export default function StoreLoading() {
  return (
    <div className="bg-[#faf7f2] min-h-screen animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-[#16120f] border-b border-[#c9a15a]/20 py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-5 w-36 rounded-full bg-stone-700/60" />
          <div className="h-10 w-72 rounded-xl bg-stone-700" />
          <div className="h-4 w-96 max-w-full rounded bg-stone-800" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
        {/* Filter Bar Skeleton */}
        <div className="rounded-xl border border-[#e4d8cb] bg-white p-5 space-y-4 shadow-xs">
          <div className="h-11 w-full rounded-lg bg-stone-100" />
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0e6db]">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-7 w-24 rounded-full bg-stone-200/70" />
            ))}
          </div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <div
              key={card}
              className="rounded-2xl border border-[#e4d8cb] bg-white p-4 space-y-3 shadow-xs"
            >
              <div className="h-56 w-full rounded-xl bg-stone-200/80" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-20 rounded bg-stone-200" />
                <div className="h-5 w-48 rounded bg-stone-300" />
                <div className="h-4 w-32 rounded bg-stone-200/70" />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                <div className="h-6 w-24 rounded bg-stone-300" />
                <div className="h-9 w-28 rounded-xl bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
