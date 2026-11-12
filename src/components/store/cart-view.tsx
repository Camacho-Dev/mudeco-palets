"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCart } from "@/components/store/cart-context";
import { useStoreConfig } from "@/components/store/store-config";
import { useSession } from "next-auth/react";
import { formatCurrency, roundMoney } from "@/lib/format";
import { needsFabrication, splitPayment } from "@/lib/made-to-order";
import { CheckoutStepBanner } from "@/components/store/checkout-step-banner";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Hammer,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LUXURY_EASE } from "@/components/store/store-motion";

export function CartView() {
  const { data: session } = useSession();
  const { items, setQty, removeItem, clear } = useCart();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const { depositPercent, leadTimeText } = useStoreConfig();

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = roundMoney(
    items.reduce((s, i) => s + roundMoney(i.price * i.quantity), 0),
  );
  const tax = roundMoney(
    items.reduce(
      (s, i) => s + roundMoney(roundMoney(i.price * i.quantity) * i.taxRate),
      0,
    ),
  );
  const total = roundMoney(subtotal + tax);
  const split = splitPayment(
    items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.price,
      taxRate: i.taxRate,
      madeToOrder: needsFabrication(
        { stock: i.stock ?? 0, madeToOrderOnly: i.madeToOrderOnly },
        i.quantity,
      ),
    })),
    total,
    depositPercent,
  );

  if (!items.length) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#faf7f2]">
        <CheckoutStepBanner
          step={1}
          badge="Carrito · Paso 1"
          title="Tu Carrito de Compras"
          subtitle="Selecciona muebles artesanales de nuestro catálogo para iniciar tu pedido o cotización."
        />
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            className="rounded-3xl border border-[#e2d5c5] bg-white p-8 sm:p-12 text-center shadow-[0_20px_50px_-20px_rgba(20,16,13,0.1)]"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-[#c9a15a]/35 bg-[#faf7f2] shadow-inner">
              <ShoppingBag className="h-8 w-8 text-[#b0894f]" strokeWidth={1.6} />
            </div>
            <p className="mt-6 text-[0.65rem] font-bold tracking-[0.22em] text-[#b0894f] uppercase">
              Selección vacía
            </p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl text-[#14100d]">
              Aún no has agregado piezas
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#786958] max-w-md mx-auto">
              Explora nuestras colecciones de comedor, sala, dormitorio y piezas
              a medida en madera de pino curada.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#14100d] px-7 py-3.5 text-xs font-bold tracking-[0.14em] text-[#f5dfa8] uppercase shadow-md transition hover:bg-[#261e18] active:scale-[0.98]"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contacto?tipo=medida"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#e2d5c5] bg-[#faf7f2] px-6 py-3.5 text-xs font-bold tracking-[0.12em] text-[#403227] uppercase transition hover:border-[#c9a15a] hover:bg-white"
              >
                <Hammer className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Cotizar a medida</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#faf7f2] pb-24 lg:pb-14">
      <CheckoutStepBanner
        step={1}
        badge="Carrito · Paso 1"
        title="Tu Carrito de Compras"
        subtitle="Revisa tus piezas, ajusta cantidades y elige cómo prefieres confirmar tu orden."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Barra superior de acciones del carrito */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2d5c5] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#786958] transition hover:text-[#14100d]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Seguir comprando</span>
            </Link>
            <span className="h-3.5 w-px bg-[#e2d5c5]" aria-hidden />
            <p className="text-xs font-bold tracking-wider text-[#14100d] uppercase">
              {items.length} {items.length === 1 ? "modelo" : "modelos"} ·{" "}
              <span className="text-[#8a6a3a]">{totalUnits} uds.</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e2d5c5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#786958] shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Vaciar carrito</span>
          </button>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Columna izquierda: tarjetas de productos */}
          <ul className="space-y-4 lg:col-span-7">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const isMadeToOrder = needsFabrication(
                  { stock: item.stock ?? 0, madeToOrderOnly: item.madeToOrderOnly },
                  item.quantity,
                );
                const lineTotal = roundMoney(item.price * item.quantity);
                const atMax =
                  item.maxQty != null && item.quantity >= item.maxQty;

                return (
                  <motion.li
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0, overflow: "hidden" }}
                    transition={{ duration: 0.28, ease: LUXURY_EASE }}
                    className="group rounded-2xl border border-[#e2d5c5] bg-white p-4 sm:p-5 shadow-[0_8px_24px_-12px_rgba(20,16,13,0.08)] transition-colors hover:border-[#c9a15a]/55"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      <Link
                        href={`/producto/${item.productId}`}
                        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#efe6d8] bg-[#f3ece2]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/producto/${item.productId}`}
                              className="font-display text-lg sm:text-xl font-medium text-[#14100d] transition-colors hover:text-[#b0894f] line-clamp-2 leading-snug"
                            >
                              {item.name}
                            </Link>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium text-[#786958]">
                                {formatCurrency(item.price)} c/u
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                                  isMadeToOrder
                                    ? "border-[#c9a15a]/40 bg-[#faf6f1] text-[#8a6a3a]"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                                }`}
                              >
                                {isMadeToOrder ? (
                                  <>
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>Por encargo</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    <span>En existencia</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          <p className="hidden sm:block font-mono text-base font-bold text-[#14100d] tabular-nums shrink-0">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f3ece2]">
                          <div className="flex items-center gap-2.5">
                            <div className="inline-flex items-center rounded-full border border-[#e2d5c5] bg-[#faf7f2] p-0.5">
                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#403227] transition hover:bg-white hover:text-[#b0894f] active:scale-90 cursor-pointer"
                                aria-label={`Quitar una unidad de ${item.name}`}
                                onClick={() =>
                                  setQty(item.productId, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center font-mono text-xs font-bold text-[#14100d] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={atMax}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#403227] transition hover:bg-white hover:text-[#b0894f] active:scale-90 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                                aria-label={`Agregar una unidad de ${item.name}`}
                                title={
                                  atMax
                                    ? `Stock máximo disponible (${item.maxQty})`
                                    : "Agregar uno"
                                }
                                onClick={() =>
                                  setQty(
                                    item.productId,
                                    item.quantity + 1,
                                    item.maxQty,
                                  )
                                }
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {atMax && (
                              <span className="text-[11px] font-semibold text-amber-700">
                                Máx. ({item.maxQty})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="sm:hidden font-mono text-sm font-bold text-[#14100d] tabular-nums">
                              {formatCurrency(lineTotal)}
                            </p>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-[#786958] transition hover:bg-rose-50 hover:text-rose-700 active:scale-95 cursor-pointer"
                              onClick={() => removeItem(item.productId)}
                              aria-label={`Eliminar ${item.name} del carrito`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Columna derecha: Resumen estilo Atelier Noir */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 relative overflow-hidden rounded-3xl border border-[#c9a15a]/30 bg-[#14100d] p-6 sm:p-7 text-[#faf6f1] shadow-[0_24px_60px_-15px_rgba(20,16,13,0.35)]">
              <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#c9a15a]/15 blur-3xl" />

              <div className="relative">
                <p className="text-[0.65rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
                  Resumen de tu selección
                </p>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl text-white">
                  Detalle del Pedido
                </h2>

                <div className="mt-5 space-y-2.5 text-sm border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal ({totalUnits} uds.)</span>
                    <span className="font-mono tabular-nums text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>ITBIS</span>
                    <span className="font-mono tabular-nums text-white">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-white/15 pt-3.5">
                    <span className="text-sm font-semibold text-white">
                      Total estimado
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#f5dfa8] tabular-nums">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  {split.hasMadeToOrder && (
                    <div className="mt-3 rounded-2xl border border-[#c9a15a]/35 bg-white/[0.05] p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Abono para iniciar ({depositPercent}%)</span>
                        <span className="font-mono text-sm text-[#f5dfa8] tabular-nums">
                          {formatCurrency(split.dueNow)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-white/65">
                        <span>Saldo contra entrega</span>
                        <span className="font-mono tabular-nums">
                          {formatCurrency(split.balance)}
                        </span>
                      </div>
                      <p className="pt-1.5 border-t border-white/10 text-[11px] text-[#d4af37] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Fabricación estimada: {leadTimeText}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e2c168] to-[#caa466] px-6 py-3.5 text-xs font-bold tracking-[0.14em] text-[#14100d] uppercase shadow-[0_8px_24px_rgba(212,175,55,0.3)] transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <span>Continuar al checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {!session?.user && (
                    <div className="text-center pt-1">
                      <Link
                        href="/login?callbackUrl=/checkout"
                        className="text-xs font-medium text-white/70 transition hover:text-[#f5dfa8] underline underline-offset-4"
                      >
                        ¿Ya tienes cuenta? Inicia sesión para autocompletar
                      </Link>
                    </div>
                  )}
                </div>

                {/* Micro-garantías Atelier */}
                <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-[11px] text-white/70">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#c9a15a]" />
                    <span>
                      Pagos verificados: Tarjeta, Transferencia (Popular,
                      Banreservas, BHD, APAP, Banesco) o Taller
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#c9a15a]" />
                    <span>
                      Madera de pino 100% curada contra polilla y humedad
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra fija inferior en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#c9a15a]/30 bg-[#14100d]/95 px-4 py-3 text-white backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">
              {split.hasMadeToOrder ? `Abono (${depositPercent}%)` : "Total"}
            </p>
            <p className="font-mono text-base font-bold text-[#f5dfa8] tabular-nums">
              {formatCurrency(split.hasMadeToOrder ? split.dueNow : total)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e2c168] to-[#caa466] px-5 py-2.5 text-xs font-bold tracking-wider text-[#14100d] uppercase shadow-md active:scale-95"
          >
            <span>Continuar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          clear();
          setConfirmClearOpen(false);
        }}
        title="¿Vaciar el carrito?"
        description="Se eliminarán todas las piezas seleccionadas de tu carrito actual."
        confirmLabel="Sí, vaciar"
        cancelLabel="Cancelar"
        isDestructive
      />
    </div>
  );
}
