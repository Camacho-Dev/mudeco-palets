export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf6f1]/80 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-2 border-[#b0894f] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#3d2a1f] uppercase animate-pulse">
          Cargando…
        </p>
      </div>
    </div>
  );
}
