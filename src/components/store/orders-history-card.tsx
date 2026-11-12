"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  FileDown,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  Check,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { WEB_STATUS_LABEL, webOrderTypeLabel } from "@/lib/web-order-labels";
import { extractReceiptFromNotes } from "@/lib/order-receipt";
import { LuxuryShoppingBagEmpty } from "./luxury-shopping-bag-empty";

type SerializedOrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type SerializedInvoice = {
  id: string;
  number: string;
  type?: string;
  paymentMode?: string | null;
  serviceKind?: string | null;
  status: string;
} | null;

type SerializedQuote = {
  id: string;
  number: string;
  type?: string;
  paymentMode?: string | null;
  serviceKind?: string | null;
  status: string;
} | null;

export type SerializedWebOrder = {
  id: string;
  number: string;
  type?: string;
  paymentMode?: string | null;
  serviceKind?: string | null;
  status: string;
  total: number;
  createdAt: string;
  notes: string | null;
  customerAddress: string | null;
  items: SerializedOrderItem[];
  invoice: SerializedInvoice;
  quote: SerializedQuote;
};

const FILTER_OPTIONS = [
  { id: "all", label: "Todos los pedidos" },
  { id: "pending", label: "Pendientes de pago" },
  { id: "production", label: "En fabricación / taller" },
  { id: "completed", label: "Completados" },
  { id: "quotes", label: "Cotizaciones a medida" },
];

export function OrdersHistoryCard({
  orders,
}: {
  orders: SerializedWebOrder[];
}) {
  const [filter, setFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeOption =
    FILTER_OPTIONS.find((o) => o.id === filter) || FILTER_OPTIONS[0];

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return (
        order.status === "PENDING" ||
        order.status === "AWAITING_PAYMENT" ||
        order.status === "CONFIRMED"
      );
    if (filter === "production")
      return order.status === "IN_PRODUCTION" || order.status === "READY";
    if (filter === "completed")
      return order.status === "PAID" || order.status === "DONE" || order.status === "DELIVERED";
    if (filter === "quotes")
      return Boolean(order.quote) || order.items.length === 0;
    return true;
  });

  return (
    <div
      id="historial"
      className="scroll-mt-28 rounded-[28px] border border-[#ede5d8] bg-white p-6 sm:p-10 shadow-[0_15px_35px_rgba(20,16,13,0.05)]"
    >
      {/* CABECERA DEL HISTORIAL */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#f3ede3] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-[#d4af37]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#16120e]">
              Historial de Compras
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#85776a]">
            {orders.length === 0
              ? "Tus compras y cotizaciones aparecerán aquí"
              : `${orders.length} ${
                  orders.length === 1
                    ? "orden registrada en tu cuenta"
                    : "órdenes registradas en tu cuenta"
                }`}
          </p>
        </div>

        {/* PÍLDORA DE FILTRO DESPLEGABLE */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[#ded3c3] bg-white px-4 py-2 text-xs font-semibold text-[#423528] shadow-xs transition-all hover:border-[#caa466] hover:bg-[#faf7f2] cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>{activeOption.label}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#85776a] transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-[#ded3c3] bg-white p-1.5 shadow-xl ring-1 ring-black/5"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setFilter(opt.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                        filter === opt.id
                          ? "bg-[#caa466]/15 font-semibold text-[#664b18]"
                          : "text-[#423528] hover:bg-[#faf7f2]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {filter === opt.id && (
                        <Check className="h-3.5 w-3.5 text-[#b0894f]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CUERPO: ESTADO VACÍO O LISTADO DE ÓRDENES */}
      <div className="pt-6">
        {filteredOrders.length === 0 ? (
          <div className="py-6 text-center">
            {/* BOLSA DE COMPRAS 3D CON PEDESTAL Y DESTELLOS DORADOS */}
            <LuxuryShoppingBagEmpty />

            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#16120e]">
              Aún no registras compras
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#7a6e62]">
              Cuando adquieras un mueble del catálogo o solicites una cotización,
              podrás consultar su estado y descargar tu factura desde aquí.
            </p>

            {/* BOTÓN DE ACCIÓN CON GLOW DORADO */}
            <div className="mt-7">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/60 bg-gradient-to-r from-[#171310] via-[#241d17] to-[#171310] px-8 py-3.5 text-xs font-bold tracking-wider text-[#f5dfa8] uppercase shadow-[0_10px_28px_rgba(201,161,90,0.25)] transition-all duration-300 hover:scale-[1.03] hover:border-[#d4af37] hover:shadow-[0_14px_36px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-[#d4af37] transition-transform group-hover:-translate-y-0.5" />
                <span>Ver catálogo</span>
                <ArrowRight className="h-4 w-4 text-[#d4af37] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusLabel =
                WEB_STATUS_LABEL[order.status] || order.status;
              const isPaid =
                order.status === "PAID" ||
                order.status === "DONE" ||
                order.invoice?.status === "PAID";
              const isCancelled = order.status === "CANCELLED";
              const isTransfer = Boolean(
                order.notes?.includes("Transferencia bancaria") ||
                  order.notes?.includes("[Pago: Transferencia bancaria]"),
              );
              const receipt = extractReceiptFromNotes(order.notes);
              const kindLabel = webOrderTypeLabel({
                ...order,
                type: order.type ?? (order.quote ? "QUOTE" : "SALE"),
              });

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#e8dfd1] bg-[#faf7f2]/50 shadow-xs transition-all hover:border-[#caa466] hover:bg-white hover:shadow-md"
                >
                  {/* Cabecera de la orden */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee4d6] bg-white px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#14100d]">
                        {order.number}
                      </span>
                      <span className="text-xs text-[#cbbba4]">·</span>
                      <span className="text-xs text-[#7d7165]">
                        {formatDate(new Date(order.createdAt))}
                      </span>
                      <span className="text-xs text-[#cbbba4]">·</span>
                      <span className="text-xs font-medium text-[#423528]">
                        {kindLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          isPaid
                            ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                            : isCancelled
                              ? "border border-rose-300 bg-rose-50 text-rose-800"
                              : "border border-[#e3cfa8] bg-[#fdf7ea] text-[#7a5824]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-600"
                              : isCancelled
                                ? "bg-rose-600"
                                : "bg-[#b0894f]"
                          }`}
                        />
                        {statusLabel}
                      </span>

                      {order.total > 0 && (
                        <span className="font-mono text-sm font-bold text-[#14100d]">
                          {formatCurrency(order.total)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo: Artículos comprados */}
                  <div className="px-5 py-4">
                    {order.items.length > 0 ? (
                      <div className="divide-y divide-[#eee4d6]">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e4d8c7] bg-white font-mono text-xs font-semibold text-[#423528]">
                                {item.quantity}x
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-medium text-[#1e1915]">
                                  {item.description}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="font-mono text-[11px] text-[#7d7165]">
                                    {formatCurrency(item.unitPrice)} c/u
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 font-mono text-xs sm:text-sm font-semibold text-[#1e1915]">
                              {formatCurrency(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#7d7165]">
                        Solicitud de cotización personalizada
                      </p>
                    )}

                    {order.customerAddress && (
                      <div className="mt-3 flex items-center gap-1.5 border-t border-[#eee4d6] pt-2.5 text-xs text-[#7d7165]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b0894f]" />
                        <span>Dirección de entrega: {order.customerAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Pie de acciones de la orden */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee4d6] bg-white px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {isTransfer && !isCancelled ? (
                        receipt ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Comprobante bancario adjuntado</span>
                          </span>
                        ) : !isPaid ? (
                          <Link
                            href={`/pedido/${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6b782] bg-[#faf2e3] px-3 py-1.5 text-xs font-semibold text-[#7a561e] transition hover:bg-[#f3e5ca]"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Adjuntar comprobante</span>
                          </Link>
                        ) : null
                      ) : null}

                      {order.invoice ? (
                        isPaid ? (
                          <a
                            href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded3c3] bg-white px-3 py-1.5 text-xs font-semibold text-[#382b20] transition hover:border-[#b0894f]"
                          >
                            <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                            <span>Factura PDF ({order.invoice.number})</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#7d7165]">
                            <Clock className="h-3.5 w-3.5 text-[#b0894f]" />
                            <span>Factura disponible al validar pago</span>
                          </span>
                        )
                      ) : null}

                      {order.quote && (
                        <a
                          href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded3c3] bg-white px-3 py-1.5 text-xs font-semibold text-[#382b20] transition hover:border-[#b0894f]"
                        >
                          <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                          <span>Cotización PDF ({order.quote.number})</span>
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/pedido/${order.id}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#14100d] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a211b]"
                    >
                      <span>Ver pedido</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#c9a15a]" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

