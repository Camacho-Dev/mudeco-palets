import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { productImage, type StoreProduct } from "@/lib/store";

export function ProductCard({ product }: { product: StoreProduct }) {
  const src = productImage(product);

  return (
    <Link href={`/producto/${product.id}`} className="store-product-card group">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe2d6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2f2018]/70 to-transparent p-4 pt-16 opacity-0 transition group-hover:opacity-100">
          <p className="text-[0.65rem] tracking-[0.14em] text-white/80 uppercase">
            Ver detalle
          </p>
        </div>
      </div>
      <div className="space-y-1.5 px-4 py-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
          {product.category}
        </p>
        <h3 className="font-display text-xl leading-snug text-[var(--wood-950)]">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <p className="text-sm font-semibold tracking-wide text-[var(--wood-800)]">
            {formatCurrency(product.price)}
          </p>
          <p className="text-[0.7rem] text-[var(--muted)]">
            {product.stock > 0 ? "Disponible" : "Bajo pedido"}
          </p>
        </div>
      </div>
    </Link>
  );
}
