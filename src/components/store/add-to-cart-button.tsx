"use client";

import { useCart } from "@/components/store/cart-context";
import { productImage } from "@/lib/product-image";
import { useState } from "react";
import { ShoppingBag, Check, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  imageUrl: string | null;
  category: string;
  stock: number;
};

export function AddToCartButton({
  product,
  showQuantity = false,
}: {
  product: Product;
  showQuantity?: boolean;
}) {
  const { addItem, items } = useCart();
  const [qty, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max = product.stock > 0 ? Math.max(1, Math.floor(product.stock)) : 20;
  const canAdd = inCart + qty <= max;

  const handleClick = () => {
    if (!canAdd) {
      setLimitReached(true);
      setTimeout(() => setLimitReached(false), 2400);
      return;
    }
    const ok = addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        taxRate: product.taxRate,
        imageUrl: productImage(product),
      },
      qty,
      max,
    );
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {showQuantity && (
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[#faf6f1] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-[var(--wood-950)] disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Disminuir cantidad"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center font-mono text-sm font-bold text-[var(--wood-950)]">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max - inCart, q + 1))}
              disabled={inCart + qty >= max}
              className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-[var(--wood-950)] disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Aumentar cantidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          className={`store-cta store-cta-primary transition-all duration-300 ${
            added
              ? "!bg-emerald-600 !text-white !border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : ""
          } ${!canAdd ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!canAdd}
          onClick={handleClick}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>¡{qty > 1 ? `${qty} agregados` : "Agregado"} al carrito!</span>
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4 stroke-[1.75]" />
                <span>Agregar al carrito {qty > 1 ? `(${qty})` : ""}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {limitReached || (!canAdd && product.stock > 0) ? (
        <p className="text-xs text-amber-700 font-medium">
          Ya alcanzaste la cantidad máxima disponible para este producto en taller.
        </p>
      ) : null}
    </div>
  );
}
