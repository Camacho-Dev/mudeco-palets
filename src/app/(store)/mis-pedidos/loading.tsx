export default function MisPedidosLoading() {
  return (
    <div className="min-h-screen bg-[#fbf8f3] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-[1360px] grid gap-8 lg:grid-cols-12 animate-pulse">
        <div className="lg:col-span-4">
          <div className="h-96 rounded-[26px] bg-white border border-[#e5dacb]" />
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="h-28 rounded-2xl bg-white border border-[#e5dacb]" />
          <div className="h-64 rounded-2xl bg-white border border-[#e5dacb]" />
        </div>
      </div>
    </div>
  );
}

