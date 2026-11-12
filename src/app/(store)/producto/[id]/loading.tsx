export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="h-14 border-b border-white/10 bg-[#14100d]" />
      <div className="mx-auto max-w-[1560px] px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-[#ebe2d6]" />
          <div className="flex flex-col justify-center space-y-5">
            <div className="h-3 w-28 rounded bg-[#e2d5c5]" />
            <div className="h-10 w-3/4 rounded-lg bg-[#e2d5c5]" />
            <div className="h-8 w-40 rounded-lg bg-[#e2d5c5]" />
            <div className="h-24 w-full rounded-xl bg-[#efe6d8]" />
            <div className="h-12 w-full rounded-xl bg-[#e2d5c5]" />
          </div>
        </div>
      </div>
    </div>
  );
}

