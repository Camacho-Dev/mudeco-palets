export default function CarritoLoading() {
  return (
    <div className="min-h-[60dvh] bg-[#faf7f2] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-stone-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white border border-stone-200" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-white border border-stone-200" />
        </div>
      </div>
    </div>
  );
}
