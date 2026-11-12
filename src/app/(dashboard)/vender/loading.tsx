export default function VenderLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-5 animate-pulse">
      <div className="space-y-4 lg:col-span-3">
        <div className="h-24 rounded-xl bg-white border border-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-slate-200" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="h-96 rounded-xl bg-white border border-slate-200" />
      </div>
    </div>
  );
}

