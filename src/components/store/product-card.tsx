import Link from "next/link";
import { StarRating } from "@/components/store/star-rating";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import { formatStoreCategory } from "@/lib/store-brand";
import { availabilityOf } from "@/lib/made-to-order";
import type { StoreProduct } from "@/lib/store";

export function ProductCard({
  product,
  tone = "light",
  badge,
  rating,
}: {
  product: StoreProduct;
  tone?: "light" | "dark";
  badge?: string;
  rating?: { average: number; count: number };
}) {
  const src = productImage(product);
  const dark = tone === "dark";
  const availability = availabilityOf(product);
  const inStock = availability === "in-stock";
  const isSoldOut = availability === "sold-out";
  const categoryLabel = formatStoreCategory(product.category);

  return (
    <Link
      href={`/producto/${product.id}`}
      prefetch={false}
      className={`${dark ? "store-product-card-dark" : "store-product-card"} group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold active:scale-[0.985] transition-transform`}
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          dark ? "bg-[#181818]" : "bg-[#ebe2d6]"
        }`}
      >
        {isSoldOut ? (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-neutral-900/90 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.2em] text-neutral-200 border border-white/25 uppercase shadow-md backdrop-blur-md">
            Agotado
          </span>
        ) : badge ? (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-[#16120f]/92 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.2em] text-brand-gold border border-brand-gold/45 uppercase shadow-md backdrop-blur-md">
            {badge}
          </span>
        ) : null}

        <Image
          src={src}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={src.startsWith("data:")}
          className={`object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${
            isSoldOut
              ? "grayscale brightness-90 group-hover:grayscale-[35%] group-hover:brightness-100"
              : ""
          }`}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-14 opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100">
          <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/90 uppercase">
            Ver detalle
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-black transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="space-y-1.5 px-4 py-4">
        <p
          className={`text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${
            dark ? "text-brand-gold/85" : "text-[#8a7260]"
          }`}
        >
          {categoryLabel}
        </p>
        <h3
          className={`font-display text-xl leading-snug transition-colors duration-200 line-clamp-1 ${
            dark
              ? "text-white group-hover:text-brand-gold"
              : "text-[var(--wood-950)] group-hover:text-[#8a6a3a]"
          }`}
        >
          {product.name}
        </h3>
        {rating && rating.count > 0 ? (
          <p className={`flex items-center gap-1.5 text-xs ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>
            <StarRating value={rating.average} size={12} />
            <span className="tabular-nums">
              {rating.average.toLocaleString("es-DO", { minimumFractionDigits: 1 })} ({rating.count})
            </span>
          </p>
        ) : null}
        <div
          className={`flex items-center justify-between gap-3 pt-2 border-t ${
            dark ? "border-white/[0.08]" : "border-black/[0.06]"
          }`}
        >
          <p
            className={`text-sm font-bold tracking-wide tabular-nums ${
              dark ? "text-brand-gold" : "text-[var(--wood-800)]"
            }`}
          >
            {formatCurrency(product.price)}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-[0.68rem] font-medium ${
              dark ? "text-[#cfcfcf]/75" : "text-[var(--muted)]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                inStock ? "bg-emerald-500" : "bg-brand-gold"
              }`}
            />
            {inStock
              ? "Listo para entrega"
              : availability === "made-to-order"
                ? "Por encargo"
                : "Agotado · Por encargo"}
          </span>
        </div>
      </div>
    </Link>
  );
}
