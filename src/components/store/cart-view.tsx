"use client";

import Link from "next/link";
import { useCart } from "@/components/store/cart-context";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/format";
import { CheckoutStepBanner } from "@/components/store/checkout-step-banner";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

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
      <div className="min-h-[70vh]">
        <CheckoutStepBanner
          step={1}
          badge="Tienda · Selección Artesanal"
          title="Carrito de Compras"
          subtitle="Revisa tus piezas antes de elegir la modalidad de pago o cotización."
        />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e2d5c5] bg-white shadow-xs">
            <ShoppingBag className="h-7 w-7 text-[#b0894f]" />
          </div>
          <h2 className="font-display mt-5 text-3xl sm:text-4xl text-[var(--wood-950)]">
            Tu carrito está vacío
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
            Explora el catálogo artesanal y agrega las piezas de madera que más te gusten.
          </p>
          <Link href="/catalogo" className="store-cta store-cta-primary mt-8 rounded-xl">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CheckoutStepBanner
        step={1}
        badge="Tienda · Selección Artesanal"
        title="Carrito de Compras"
        subtitle="Ajusta cantidades o continúa para elegir transferencia, pago en taller o cotización."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5d8c8] pb-4">
          <p className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
            {items.length} {items.length === 1 ? "pieza seleccionada" : "piezas seleccionadas"}
          </p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:border-rose-300 hover:text-rose-700 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Vaciar carrito</span>
          </button>
        </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <ul className="divide-y divide-[#efe6d8] overflow-hidden rounded-2xl border border-[#e2d5c5] bg-white shadow-xs lg:col-span-7">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-24 w-20 rounded-xl border border-[#efe6d8] object-cover sm:h-28 sm:w-24"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/producto/${item.productId}`}
                  className="font-display text-lg font-medium text-[var(--wood-950)] hover:text-[#b0894f] transition"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">
                  {formatCurrency(item.price)} c/u
                </p>
                <div className="mt-3.5 flex items-center gap-2">
                  <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[#faf7f2]">
                    <button
                      type="button"
                      className="p-2 text-[var(--wood-900)] hover:text-[#b0894f] transition cursor-pointer"
                      aria-label="Quitar uno"
                      onClick={() => setQty(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[var(--wood-950)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="p-2 text-[var(--wood-900)] hover:text-[#b0894f] transition cursor-pointer"
                      aria-label="Agregar uno"
                      onClick={() => setQty(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="ml-2 rounded-lg p-1.5 text-[var(--muted)] hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Quitar del carrito"
                    title="Eliminar pieza"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-[var(--wood-950)]">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-display text-2xl text-[var(--wood-950)]">
              Resumen del pedido
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>ITBIS (18%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--wood-950)]">
                <span>Total estimado</span>
                <span className="text-lg text-[#8a6a3a]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href="/checkout"
                className="store-cta store-cta-primary w-full flex items-center justify-center gap-2 rounded-xl shadow-sm"
              >
                <span>Continuar al checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {!session?.user && (
                <div className="text-center pt-1">
                  <Link
                    href="/login?callbackUrl=/checkout"
                    className="text-xs font-medium text-[var(--muted)] hover:text-[var(--wood-950)] underline underline-offset-2"
                  >
                    ¿Ya tienes cuenta? Inicia sesión para autocompletar
                  </Link>
                </div>
              )}
            </div>

            {/* Micro-garantías de compra artesanal */}
            <div className="rounded-xl bg-[#faf6f1] p-3.5 text-[11px] text-[var(--muted)] space-y-1.5 border border-[#e5d8c8]">
              <div className="flex items-center gap-2 font-medium text-[var(--wood-900)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
                <span>Transferencias seguras: Popular, Banreservas y BHD</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-[var(--wood-900)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
                <span>Madera de pino 100% curada contra polilla y humedad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

