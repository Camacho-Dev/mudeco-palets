export default function PanelLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 w-72 rounded-xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-white border border-slate-200" />
        <div className="h-72 rounded-2xl bg-white border border-slate-200" />
      </div>
    </div>
  );
}

