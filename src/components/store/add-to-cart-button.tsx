"use client";

import { useCart } from "@/components/store/cart-context";
import { useSession } from "next-auth/react";
import { productImage } from "@/lib/product-image";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";

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

export function AddToCartButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const inCart =
    items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max =
    product.stock > 0 ? Math.max(1, Math.floor(product.stock)) : 20;
  const canAdd = inCart < max;

  const handleClick = () => {
    // Si no ha iniciado sesión, no permitir agregar al carrito y abrir login modal
    if (!session?.user) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("mudeco:welcome", { detail: { reason: "cart" } }),
        );
      }
      return;
    }

    if (!canAdd) {
      setLimitReached(true);
      setTimeout(() => setLimitReached(false), 2000);
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
      1,
      max,
    );
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-2">
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
              <span>¡Agregado al carrito!</span>
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
              <span>Agregar al carrito</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {limitReached || (!canAdd && product.stock > 0) ? (
        <p className="text-xs text-amber-700 font-medium">
          Ya alcanzaste la cantidad máxima disponible para este producto.
        </p>
      ) : null}
    </div>
  );
}

