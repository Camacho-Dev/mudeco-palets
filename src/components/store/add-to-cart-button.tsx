"use client";

import { useCart } from "@/components/store/cart-context";
import { useStoreConfig } from "@/components/store/store-config";
import { productImage } from "@/lib/product-image";
import { availabilityOf, needsFabrication } from "@/lib/made-to-order";
import { storeWhatsApp } from "@/lib/store-info";
import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Hammer,
  Ruler,
  MessageCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  imageUrl: string | null;
  category: string;
  stock: number;
  madeToOrderOnly?: boolean;
};

export function AddToCartButton({
  product,
  showQuantity = false,
}: {
  product: Product;
  showQuantity?: boolean;
}) {
  const { addItem, items } = useCart();
  const { leadTimeText, depositPercent, phone } = useStoreConfig();
  const [qty, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showSoldOutModal, setShowSoldOutModal] = useState(false);

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max = Math.max(20, Math.floor(product.stock));
  const canAdd = inCart + qty <= max;
  const availability = availabilityOf(product);
  const isSoldOut = availability === "sold-out";
  const isMadeToOrder = needsFabrication(product, inCart + qty);

  const addProductToCart = () => {
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
        stock: product.stock,
        madeToOrderOnly: Boolean(product.madeToOrderOnly),
      },
      qty,
      max,
    );
    if (!ok) return;
    setAdded(true);
    setShowSoldOutModal(false);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleClick = () => {
    if (isSoldOut) {
      setShowSoldOutModal(true);
      return;
    }
    addProductToCart();
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
                <span>
                  {isSoldOut
                    ? "Agotado — ¿deseas pedirlo?"
                    : `Agregar al carrito ${qty > 1 ? `(${qty})` : ""}`}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {isMadeToOrder ? (
        <p className="text-xs font-medium text-[#8a6a3a]">
          Por encargo · Listo en {leadTimeText} · Abono del {depositPercent}% al ordenar
        </p>
      ) : null}

      {limitReached || !canAdd ? (
        <p className="text-xs text-amber-700 font-medium">
          Ya alcanzaste el máximo de {max} unidades por pedido en línea.
        </p>
      ) : null}

      <AnimatePresence>
        {showSoldOutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => setShowSoldOutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                    Agotado en existencia
                  </span>
                  <h3 className="font-display mt-1.5 text-2xl text-[var(--wood-950)]">
                    ¿Deseas pedirlo al taller?
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Fabricamos <strong className="text-[var(--wood-900)]">{product.name}</strong> bajo pedido. Elige cómo prefieres continuar:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSoldOutModal(false)}
                  aria-label="Cerrar"
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={addProductToCart}
                  className="w-full flex items-start gap-3 rounded-xl border-2 border-[#c9a15a] bg-[#faf6f1] p-3.5 text-left transition hover:bg-[#f4ecdf] cursor-pointer"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14100d] text-[#c9a15a]">
                    <Hammer className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--wood-950)]">
                      Encárgalo igual · Recomendada
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Mismo modelo y medidas. Listo en {leadTimeText}. Solo pagas {depositPercent}% de abono hoy y el resto contra entrega.
                    </p>
                  </div>
                </button>

                <Link
                  href={`/contacto?tipo=cotizar&pieza=${encodeURIComponent(product.name)}`}
                  onClick={() => setShowSoldOutModal(false)}
                  className="w-full flex items-start gap-3 rounded-xl border border-[#e2d5c5] bg-white p-3.5 text-left transition hover:border-[#c9a15a] hover:bg-[#faf6f1]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#faf6f1] text-[#8a6a3a] border border-[#e2d5c5]">
                    <Ruler className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--wood-950)]">
                      Personalízalo a tu medida
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Cambia medidas, tono de madera o acabados con una cotización directa al taller.
                    </p>
                  </div>
                </Link>

                <a
                  href={storeWhatsApp(
                    phone,
                    `Hola, me interesa "${product.name}", que aparece agotado en la tienda. ¿Cómo puedo encargarlo?`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSoldOutModal(false)}
                  className="w-full flex items-start gap-3 rounded-xl border border-[#e2d5c5] bg-white p-3.5 text-left transition hover:border-emerald-500/60 hover:bg-emerald-50/40"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--wood-950)]">
                      Pregunta por WhatsApp
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Consulta disponibilidad rápida o tiempos de entrega directamente con nuestro equipo.
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
