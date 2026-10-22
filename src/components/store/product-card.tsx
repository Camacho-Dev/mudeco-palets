import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import type { StoreProduct } from "@/lib/store";

export function ProductCard({
  product,
  tone = "light",
  badge,
}: {
  product: StoreProduct;
  tone?: "light" | "dark";
  badge?: string;
}) {
  const src = productImage(product);
  const dark = tone === "dark";

  return (
    <Link
      href={`/producto/${product.id}`}
      className={dark ? "store-product-card-dark group" : "store-product-card group"}
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          dark ? "bg-[#1a1a1a]" : "bg-[#ebe2d6]"
        }`}
      >
        {badge ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-sm bg-black/90 px-2.5 py-0.5 text-[0.6rem] font-bold tracking-widest text-[#d4af37] border border-[#d4af37]/40 uppercase shadow-sm">
            {badge}
          </span>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 opacity-0 transition group-hover:opacity-100">
          <p className="text-[0.65rem] tracking-[0.14em] text-white/80 uppercase">
            Ver detalle
          </p>
        </div>
      </div>
      <div className="space-y-1.5 px-4 py-4">
        <p
          className={`text-[0.65rem] font-semibold tracking-[0.16em] uppercase ${
            dark ? "text-[#c9a15a]/80" : "text-[var(--muted)]"
          }`}
        >
          {product.category}
        </p>
        <h3
          className={`font-display text-xl leading-snug ${
            dark ? "text-white" : "text-[var(--wood-950)]"
          }`}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <p
            className={`text-sm font-semibold tracking-wide ${
              dark ? "text-[#c9a15a]" : "text-[var(--wood-800)]"
            }`}
          >
            {formatCurrency(product.price)}
          </p>
          <p className={`text-[0.7rem] ${dark ? "text-[#cfcfcf]/70" : "text-[var(--muted)]"}`}>
            {product.stock > 0 ? "Disponible" : "Bajo pedido"}
          </p>
        </div>
      </div>
    </Link>
  );
}
