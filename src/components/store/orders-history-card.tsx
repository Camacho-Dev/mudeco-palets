"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  Package,
  ShoppingBag,
  Upload,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { webOrderTypeLabel } from "@/lib/web-order-labels";
import { extractReceiptFromNotes } from "@/lib/order-receipt";

type SerializedOrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type SerializedDoc = {
  id: string;
  number: string;
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
  invoice: SerializedDoc;
  quote: SerializedDoc;
};

const PAGE_SIZE = 5;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Estado del pedido explicado para el cliente (no para el taller) */
const CUSTOMER_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Pendiente de pago", tone: "amber" },
  AWAITING_PAYMENT: { label: "Validando pago", tone: "sky" },
  IN_PROGRESS: { label: "En preparación", tone: "amber" },
  QUOTED: { label: "Cotización en revisión", tone: "violet" },
  PAID: { label: "Pagado", tone: "emerald" },
  DONE: { label: "Completado", tone: "emerald" },
  CANCELLED: { label: "Cancelado", tone: "stone" },
};

type Tone = "amber" | "sky" | "violet" | "emerald" | "stone";

const TONE_CLASS: Record<Tone, { badge: string; dot: string }> = {
  amber: { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  sky: { badge: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  violet: { badge: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  stone: { badge: "bg-stone-100 text-stone-600 ring-stone-200", dot: "bg-stone-400" },
};

type FilterId = "all" | "active" | "quotes" | "completed" | "cancelled";

function isQuote(o: SerializedWebOrder) {
  return o.type === "QUOTE" || Boolean(o.quote) || o.status === "QUOTED";
}

const FILTERS: { id: FilterId; label: string; match: (o: SerializedWebOrder) => boolean }[] = [
  { id: "all", label: "Todos", match: () => true },
  {
    id: "active",
    label: "En curso",
    match: (o) =>
      !isQuote(o) && ["PENDING", "AWAITING_PAYMENT", "IN_PROGRESS"].includes(o.status),
  },
  { id: "quotes", label: "Cotizaciones", match: (o) => isQuote(o) && o.status !== "CANCELLED" },
  { id: "completed", label: "Completados", match: (o) => ["PAID", "DONE"].includes(o.status) && !isQuote(o) },
  { id: "cancelled", label: "Cancelados", match: (o) => o.status === "CANCELLED" },
];

/** Números de página con elipsis: 1 … 4 5 6 … 12 */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("…");
    out.push(p);
  });
  return out;
}

function itemSummary(o: SerializedWebOrder) {
  if (!o.items.length) return "Solicitud de cotización personalizada";
  const [first, ...rest] = o.items;
  const qty = first.quantity > 1 ? ` × ${first.quantity}` : "";
  const more = rest.length ? ` · +${rest.length} ${rest.length === 1 ? "artículo" : "artículos"}` : "";
  return `${first.description}${qty}${more}`;
}

export function OrdersHistoryCard({ orders }: { orders: SerializedWebOrder[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<FilterId>("all");
  const [page, setPageState] = useState(1);
  // La lista solo anima cuando el usuario cambia de página o filtro (no al cargar)
  const [interacted, setInteracted] = useState(false);
  const listTopRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const counts = useMemo(
    () =>
      Object.fromEntries(FILTERS.map((f) => [f.id, orders.filter(f.match).length])) as Record<
        FilterId,
        number
      >,
    [orders],
  );

  const filtered = useMemo(
    () => orders.filter(FILTERS.find((f) => f.id === filter)!.match),
    [orders, filter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Al cambiar de página, volver al inicio de la lista si quedó fuera de vista
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = listTopRef.current;
    if (el && el.getBoundingClientRect().top < 80) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [safePage, reduce]);

  function setPage(p: number) {
    setInteracted(true);
    setPageState(p);
  }

  function selectFilter(id: FilterId) {
    setInteracted(true);
    setFilter(id);
    setPageState(1);
  }

  return (
    <section
      id="historial"
      aria-labelledby="historial-title"
      className="scroll-mt-28 rounded-3xl border border-[#ece4d8] bg-white shadow-[0_1px_2px_rgba(27,21,17,0.04),0_16px_40px_-24px_rgba(27,21,17,0.25)]"
    >
      <div ref={listTopRef} className="scroll-mt-28 px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="historial-title" className="font-display text-2xl text-[#16120e] sm:text-[28px]">
              Mis pedidos
            </h2>
            <p className="mt-1 text-sm text-[#85776a]">
              {orders.length === 0
                ? "Tus compras y cotizaciones aparecerán aquí."
                : `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"} en tu cuenta`}
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div
            role="tablist"
            aria-label="Filtrar pedidos"
            className="-mx-5 mt-5 flex gap-1 overflow-x-auto px-5 pb-px [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              const disabled = f.id !== "all" && counts[f.id] === 0;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => selectFilter(f.id)}
                  className={`relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-default disabled:opacity-40 ${
                    active ? "text-white" : "text-[#5c4f43] hover:text-[#16120e]"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="orders-filter-pill"
                      className="absolute inset-0 rounded-full bg-[#16120e]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                    />
                  ) : null}
                  <span className="relative">{f.label}</span>
                  <span
                    className={`relative text-[11px] tabular-nums ${
                      active ? "text-[#c9a15a]" : "text-[#a39483]"
                    }`}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-4 border-t border-[#f1ebe2]">
        {orders.length === 0 ? (
          <EmptyState
            title="Aún no tienes pedidos"
            text="Cuando compres un mueble o pidas una cotización, podrás seguir su estado y descargar tu factura desde aquí."
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nada por aquí" text="No tienes pedidos en esta categoría." compact />
        ) : (
          // La clave cambia con el filtro y la página: la lista nueva entra
          // con un fundido corto (sin animación de salida que retrase el clic).
          <motion.ul
            key={`${filter}-${safePage}`}
            initial={reduce || !interacted ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="divide-y divide-[#f1ebe2]"
          >
            {pageOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </motion.ul>
        )}
      </div>

      {filtered.length > PAGE_SIZE ? (
        <nav
          aria-label="Paginación de pedidos"
          className="flex flex-col items-center justify-between gap-3 border-t border-[#f1ebe2] px-5 py-4 sm:flex-row sm:px-8"
        >
          <p className="text-xs text-[#85776a]" aria-live="polite">
            Mostrando <span className="font-semibold text-[#16120e] tabular-nums">{from}–{to}</span> de{" "}
            <span className="font-semibold text-[#16120e] tabular-nums">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <PageButton
              label="Página anterior"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </PageButton>
            {pageList(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="w-6 text-center text-xs text-[#a39483]">
                  …
                </span>
              ) : (
                <PageButton
                  key={p}
                  label={`Página ${p}`}
                  current={p === safePage}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PageButton>
              ),
            )}
            <PageButton
              label="Página siguiente"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </PageButton>
          </div>
        </nav>
      ) : null}
    </section>
  );
}

function PageButton({
  children,
  label,
  current,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[13px] font-medium tabular-nums transition-colors cursor-pointer active:scale-95 disabled:cursor-default disabled:opacity-35 disabled:active:scale-100 ${
        current
          ? "bg-[#16120e] text-white"
          : "text-[#5c4f43] hover:bg-[#f5f0e8] hover:text-[#16120e]"
      }`}
    >
      {children}
    </button>
  );
}

function OrderRow({ order }: { order: SerializedWebOrder }) {
  const status = CUSTOMER_STATUS[order.status] || { label: order.status, tone: "stone" as Tone };
  const tone = TONE_CLASS[status.tone];
  const cancelled = order.status === "CANCELLED";
  const paid = order.status === "PAID" || order.status === "DONE" || order.invoice?.status === "PAID";
  const quote = isQuote(order);
  const isTransfer =
    order.paymentMode === "TRANSFER" || Boolean(order.notes?.includes("Transferencia bancaria"));
  const receipt = extractReceiptFromNotes(order.notes);
  const kindLabel = webOrderTypeLabel({
    ...order,
    type: order.type ?? (order.quote ? "QUOTE" : "SALE"),
  });

  const needsReceipt = isTransfer && !cancelled && !paid && !receipt;
  const showInvoice = Boolean(order.invoice && paid);
  const showQuote = Boolean(order.quote && !cancelled);

  return (
    <li className="group relative transition-colors hover:bg-[#fbf8f3] focus-within:bg-[#fbf8f3]">
      <div className="flex items-center gap-4 px-5 py-4 sm:px-8">
        <span
          aria-hidden
          className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${
            cancelled ? "bg-stone-100 text-stone-400" : "bg-[#f5efe5] text-[#9a7a45]"
          }`}
        >
          {quote ? <FileText className="h-5 w-5" strokeWidth={1.6} /> : <Package className="h-5 w-5" strokeWidth={1.6} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/pedido/${order.id}`}
              className="font-mono text-[13px] font-semibold text-[#16120e] outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {order.number}
            </Link>
            <span className="text-xs text-[#a39483]">{formatDate(new Date(order.createdAt))}</span>
            <span className="hidden text-xs text-[#a39483] md:inline">· {kindLabel}</span>
          </div>
          <p
            className={`mt-0.5 truncate text-sm ${
              cancelled ? "text-[#a39483] line-through decoration-[#d6cdbf]" : "text-[#3d3229]"
            }`}
          >
            {itemSummary(order)}
          </p>

          {needsReceipt || showInvoice || showQuote || receipt ? (
            <div className="relative z-10 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {needsReceipt ? (
                <Link
                  href={`/pedido/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Adjuntar comprobante
                </Link>
              ) : null}
              {receipt && isTransfer && !cancelled ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Comprobante enviado
                </span>
              ) : null}
              {showInvoice && order.invoice ? (
                <a
                  href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b5a48] hover:text-[#16120e] hover:underline"
                >
                  <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                  Factura {order.invoice.number}
                </a>
              ) : null}
              {showQuote && order.quote ? (
                <a
                  href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b5a48] hover:text-[#16120e] hover:underline"
                >
                  <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                  Cotización {order.quote.number}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${tone.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
            {status.label}
          </span>
          {order.total > 0 ? (
            <span
              className={`text-sm font-semibold tabular-nums ${
                cancelled ? "text-[#a39483]" : "text-[#16120e]"
              }`}
            >
              {formatCurrency(order.total)}
            </span>
          ) : (
            <span className="text-xs text-[#a39483]">Por cotizar</span>
          )}
        </div>

        <ArrowRight
          aria-hidden
          className="hidden h-4 w-4 shrink-0 text-[#c8bba8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#16120e] sm:block"
        />
      </div>
    </li>
  );
}

function EmptyState({ title, text, compact }: { title: string; text: string; compact?: boolean }) {
  return (
    <div className={`px-6 text-center ${compact ? "py-12" : "py-16"}`}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5efe5] text-[#9a7a45]">
        <ShoppingBag className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <h3 className="mt-4 font-display text-2xl text-[#16120e]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[#85776a]">{text}</p>
      {!compact ? (
        <Link
          href="/catalogo"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#16120e] px-6 text-sm font-medium text-white transition-colors hover:bg-[#2a211b] active:scale-[0.98]"
        >
          Ver catálogo
          <ArrowRight className="h-4 w-4 text-[#c9a15a]" />
        </Link>
      ) : null}
    </div>
  );
}
