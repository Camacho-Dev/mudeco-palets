const CONTAINER =
  "mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20";

const BLOCK = "rounded-xl bg-neutral-200";

type Variant = "catalog" | "product" | "checkout";

/** Skeleton compartido para los loading.tsx de la tienda. */
export function StoreSkeleton({ variant = "catalog" }: { variant?: Variant }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="min-h-screen bg-neutral-50"
    >
      <div className="border-b border-neutral-800 bg-neutral-900 py-12">
        <div className={`${CONTAINER} space-y-3`}>
          <div className="h-4 w-32 rounded-full bg-neutral-700" />
          <div className="h-9 w-72 max-w-full rounded-xl bg-neutral-700" />
          <div className="h-4 w-96 max-w-full rounded bg-neutral-800" />
        </div>
      </div>

      <div
        className={`${CONTAINER} py-10 animate-pulse motion-reduce:animate-none`}
      >
        {variant === "catalog" && (
          <div className="space-y-8">
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
              <div className={`h-11 w-full ${BLOCK} bg-neutral-100`} />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-7 w-24 rounded-full bg-neutral-200" />
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className={`aspect-[4/5] w-full ${BLOCK}`} />
                  <div className="h-3 w-20 rounded bg-neutral-200" />
                  <div className="h-5 w-48 max-w-full rounded bg-neutral-300" />
                  <div className="h-6 w-24 rounded bg-neutral-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === "product" && (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="aspect-[4/5] rounded-2xl bg-neutral-200" />
            <div className="flex flex-col justify-center space-y-5">
              <div className="h-3 w-28 rounded bg-neutral-200" />
              <div className={`h-10 w-3/4 ${BLOCK}`} />
              <div className={`h-8 w-40 ${BLOCK}`} />
              <div className={`h-24 w-full ${BLOCK} bg-neutral-100`} />
              <div className={`h-12 w-full ${BLOCK}`} />
            </div>
          </div>
        )}

        {variant === "checkout" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="h-72 rounded-2xl border border-neutral-200 bg-white" />
              <div className="h-44 rounded-2xl border border-neutral-200 bg-white" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-80 rounded-2xl border border-neutral-200 bg-white" />
            </div>
          </div>
        )}
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
