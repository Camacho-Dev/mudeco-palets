import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import type { StoreProduct } from "@/lib/store";

function formatCategoryName(cat: string): string {
  const map: Record<string, string> = {
    "BASE DE CAMA": "Bases de Cama",
    "MESA DE COMEDOR": "Mesas de Comedor",
    "MESA DE CENTRO": "Mesas de Centro",
    "GAVETEROS": "Gaveteros",
    "MESA DE NOCHE": "Mesas de Noche",
    "REPISA DE TV": "Repisas de TV",
    "BANCO": "Bancos",
    "REPISA DE ENTRADA": "Repisas de Entrada",
  };
  return map[cat.toUpperCase()] || cat;
}

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
  const inStock = product.stock > 0;
  const categoryLabel = formatCategoryName(product.category);

  return (
    <Link
      href={`/producto/${product.id}`}
      className={dark ? "store-product-card-dark group" : "store-product-card group"}
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          dark ? "bg-[#181818]" : "bg-[#ebe2d6]"
        }`}
      >
        {badge ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-[2px] bg-[#16120f]/90 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.2em] text-[#d4af37] border border-[#d4af37]/45 uppercase shadow-md backdrop-blur-md">
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

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-14 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-white/90 uppercase">
            Ver detalle
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a15a] text-black transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="space-y-1.5 px-4 py-4">
        <p
          className={`text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${
            dark ? "text-[#c9a15a]/85" : "text-[#8a7260]"
          }`}
        >
          {categoryLabel}
        </p>
        <h3
          className={`font-display text-xl leading-snug transition-colors duration-200 line-clamp-1 ${
            dark
              ? "text-white group-hover:text-[#c9a15a]"
              : "text-[var(--wood-950)] group-hover:text-[#8a6a3a]"
          }`}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-3 pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
          <p
            className={`text-sm font-semibold tracking-wide ${
              dark ? "text-[#c9a15a]" : "text-[var(--wood-800)]"
            }`}
          >
            {formatCurrency(product.price)}
          </p>
          <p className={`text-[0.68rem] ${dark ? "text-[#cfcfcf]/70" : "text-[var(--muted)]"}`}>
            {inStock ? "Listo para entrega" : "Bajo pedido"}
          </p>
        </div>
      </div>
    </Link>
  );
}

