export default function CheckoutLoading() {
  return (
    <div className="min-h-[75vh] bg-[#faf7f2]">
      <div className="h-36 border-b border-[#c9a15a]/25 bg-[#14100d]" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 animate-pulse">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-72 rounded-2xl border border-[#e2d5c5] bg-white" />
            <div className="h-44 rounded-2xl border border-[#e2d5c5] bg-white" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 rounded-2xl border border-[#e2d5c5] bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

