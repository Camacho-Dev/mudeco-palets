"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Check } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import { useCart } from "@/components/store/cart-context";
import { motion } from "framer-motion";

export type ShelfProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  taxRate: number;
  stock: number;
  imageUrl: string | null;
  badge?: string;
};

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3 fill-[#c9a15a] text-[#c9a15a]"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ShelfCard({ product }: { product: ShelfProduct }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max = product.stock > 0 ? Math.max(1, Math.floor(product.stock)) : 20;
  const canAdd = inCart < max;
  const src = productImage(product);

  const handleAdd = () => {
    if (!canAdd) return;
    const ok = addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        taxRate: product.taxRate,
        imageUrl: src,
      },
      1,
      max,
    );
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group w-[190px] shrink-0 snap-start sm:w-[230px] md:w-[260px] lg:w-[280px]">
      <div className="overflow-hidden border border-white/[0.08] bg-[#141414] transition-all duration-300 hover:border-[#c9a15a]/50 hover:shadow-[0_12px_28px_rgba(201,161,90,0.18)] hover:-translate-y-1 rounded-sm">
        <Link
          href={`/producto/${product.id}`}
          className="relative block aspect-square overflow-hidden bg-[#1a1a1a]"
        >
          {product.badge ? (
            <span className="absolute top-2 left-2 z-10 rounded bg-gradient-to-r from-black/95 to-black/85 px-2 py-0.5 text-[0.55rem] font-bold tracking-widest text-[#d4af37] border border-[#d4af37]/40 uppercase shadow-md backdrop-blur-md">
              {product.badge}
            </span>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        <div className="space-y-2 p-3.5">
          <p className="text-[0.58rem] font-medium tracking-[0.14em] text-[#c9a15a]/85 uppercase">
            {product.category}
          </p>
          <Link href={`/producto/${product.id}`}>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-white transition-colors duration-200 group-hover:text-[#c9a15a]">
              {product.name}
            </h3>
          </Link>
          <Stars />
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.05]">
            <p className="text-sm font-semibold text-[#c9a15a]">
              {formatCurrency(product.price)}
            </p>
            <motion.button
              type="button"
              disabled={!canAdd}
              whileTap={{ scale: 0.88 }}
              aria-label="Agregar al carrito"
              onClick={handleAdd}
              className={`inline-flex h-8 w-8 items-center justify-center border transition-all duration-300 disabled:opacity-40 ${
                added
                  ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-400"
                  : "border-[#c9a15a]/45 text-[#c9a15a] hover:bg-[#c9a15a] hover:text-[#0a0a0a]"
              }`}
            >
              {added ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductShelf({
  title,
  subtitle,
  href,
  products,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  products: ShelfProduct[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateProgress = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    return () => el.removeEventListener("scroll", updateProgress);
  }, []);

  if (!products.length) return null;

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 900), behavior: "smooth" });
  }

  return (
    <section className="border-b border-white/[0.06] py-8 sm:py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-white md:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#d7d7d7]/75">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {href ? (
            <Link
              href={href}
              className="mr-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[#c9a15a] uppercase transition hover:text-[#d4b06e]"
            >
              Ver más →
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="hidden h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition hover:border-[#c9a15a]/50 hover:text-white sm:inline-flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="hidden h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition hover:border-[#c9a15a]/50 hover:text-white sm:inline-flex"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <ShelfCard key={p.id} product={p} />
        ))}
      </div>

      {/* Indicador de desplazamiento sutil */}
      <div className="mt-2 h-0.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c9a15a]/60 transition-all duration-150"
          style={{ width: `${Math.max(12, scrollProgress)}%` }}
        />
      </div>
    </section>
  );
}
