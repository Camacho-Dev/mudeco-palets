export default function CatalogoLoading() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/5" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
