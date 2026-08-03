import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { StoreProduct } from "@/lib/store";

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#efe6dc]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-end p-4"
            style={{
              background:
                "linear-gradient(145deg, #5c4334 0%, #3d2a1f 45%, #b0894f 140%)",
            }}
          >
            <p className="font-display text-lg text-white/90">{product.name}</p>
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">
          {product.category}
        </p>
        <h3 className="font-medium text-[var(--wood-950)] group-hover:text-[var(--wood-800)]">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <p className="font-display text-lg text-[var(--wood-950)]">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {product.stock > 0 ? "Disponible" : "Bajo pedido"}
          </p>
        </div>
      </div>
    </Link>
  );
}
