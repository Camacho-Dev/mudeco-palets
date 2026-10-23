"use client";

import Link from "next/link";
import { useCart } from "@/components/store/cart-context";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/format";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export function CartView() {
  const { data: session } = useSession();
  const { items, setQty, removeItem, subtotal, clear } = useCart();
  const tax = items.reduce(
    (s, i) => s + i.price * i.quantity * i.taxRate,
    0,
  );
  const total = subtotal + tax;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-10 w-10 text-[var(--muted)]" />
        <h1 className="font-display mt-4 text-3xl text-[var(--wood-950)]">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Explora el catálogo y agrega las piezas que te gusten.
        </p>
        <Link href="/catalogo" className="store-cta store-cta-primary mt-8">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
            Tienda
          </p>
          <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
            Carrito
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Vaciar
        </button>
      </div>

      <ul className="mt-10 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-24 w-20 object-cover sm:h-28 sm:w-24"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/producto/${item.productId}`}
                className="font-medium text-[var(--wood-950)] hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {formatCurrency(item.price)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1"
                  aria-label="Quitar uno"
                  onClick={() => setQty(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  className="rounded border border-[var(--border)] p-1"
                  aria-label="Agregar uno"
                  onClick={() => setQty(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="ml-2 text-[var(--muted)] hover:text-rose-700"
                  onClick={() => removeItem(item.productId)}
                  aria-label="Quitar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-[var(--wood-800)]">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 ml-auto max-w-sm space-y-2 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[var(--muted)]">
          <span>ITBIS</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold text-[var(--wood-950)]">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {session?.user ? (
          <Link
            href="/checkout"
            className="store-cta store-cta-primary mt-4 w-full"
          >
            Continuar al checkout
          </Link>
        ) : (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("mudeco:welcome", {
                      detail: { reason: "checkout" },
                    }),
                  );
                }
              }}
              className="store-cta store-cta-primary w-full cursor-pointer"
            >
              Iniciar sesión para comprar
            </button>
            <p className="text-center text-[0.72rem] text-[var(--muted)]">
              Debes iniciar sesión con tu cuenta para procesar tu pedido.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

