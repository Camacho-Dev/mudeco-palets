import { Suspense } from "react";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { ConfirmForm } from "@/components/confirm-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/store";
import {
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Download,
  Activity,
  Eye,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  MessageSquare,
} from "lucide-react";
import { stripReceiptFromNotes, extractReceiptFromNotes } from "@/lib/order-receipt";
import {
  WEB_STATUS_COLORS,
  WEB_STATUS_LABEL,
  isWebOrderPending,
  webOrderTypeLabel,
} from "@/lib/web-order-labels";
import {
  cancelWebOrder,
  markWebOrderDone,
  markWebOrderInProgress,
} from "./actions";

const TYPE_FILTERS = [
  { key: "", label: "Todos" },
  { key: "sale", label: "Ventas" },
  { key: "cart_quote", label: "Cotiz. carrito" },
  { key: "CUSTOM_QUOTE", label: "A medida" },
  { key: "CONTACT", label: "Consultas" },
] as const;

const STATUS_FILTERS = [
  { key: "", label: "Cualquier estado" },
  { key: "pending", label: "Pendientes" },
  { key: "IN_PROGRESS", label: "En gestión" },
  { key: "DONE", label: "Atendidos" },
  { key: "CANCELLED", label: "Cancelados" },
] as const;

function buildHref(opts: {
  tipo?: string;
  estado?: string;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (opts.tipo) params.set("tipo", opts.tipo);
  if (opts.estado) params.set("estado", opts.estado);
  if (opts.q) params.set("q", opts.q);
  const s = params.toString();
  return s ? `/pedidos-web?${s}` : "/pedidos-web";
}

export default async function PedidosWebPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string; q?: string }>;
}) {
  await requireSession();
  const { tipo, estado, q } = await searchParams;
  const query = (q || "").trim();

  const orders = await prisma.webOrder.findMany({
    where: query
      ? {
          OR: [
            { number: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
            { customerEmail: { contains: query, mode: "insensitive" } },
            { customerPhone: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      invoice: { select: { id: true, number: true, status: true } },
      quote: { select: { id: true, number: true, status: true } },
    },
  });

  const filtered = orders.filter((o) => {
    if (tipo === "sale" && o.type !== "SALE") return false;
    if (tipo === "cart_quote" && !(o.type === "QUOTE" && !o.serviceKind))
      return false;
    if (
      tipo &&
      tipo !== "sale" &&
      tipo !== "cart_quote" &&
      o.serviceKind !== tipo
    )
      return false;

    if (estado === "pending" && !isWebOrderPending(o.status)) return false;
    if (
      estado &&
      estado !== "pending" &&
      o.status !== estado
    )
      return false;

    return true;
  });

  const pendingCount = orders.filter((o) => isWebOrderPending(o.status)).length;
  const inProgressCount = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const quotedCount = orders.filter((o) => o.status === "QUOTED").length;
  const salesCount = orders.filter((o) => o.type === "SALE").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = orders.filter((o) => o.createdAt >= today).length;

  return (
    <div>
      <PageHeader
        title="Pedidos web"
        description={
          query
            ? `Resultados para “${query}”`
            : `${pendingCount} pendientes · Compras, cotizaciones y consultas`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/conexion-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Centro de control y diagnóstico de la conexión web"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Conexión Web</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Abrir tienda en nueva pestaña"
            >
              <Globe className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Tienda pública</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <Link
              href="/contenido-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Fotos & Portadas</span>
            </Link>
            <a
              href="/api/export/pedidos-web"
              download
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Descargar pedidos en formato CSV para Excel"
            >
              <Download className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Exportar CSV</span>
            </a>
          </div>
        }
      />

      {/* KPI Cards con micro-interacciones y diseño SaaS premium */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pendientes */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/80 hover:shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
              Pendientes
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <Clock className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.68rem] font-bold text-amber-800 animate-pulse">
                Acción req.
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Incluye en gestión y por responder
          </p>
        </div>

        {/* Card 2: En gestión */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/80 hover:shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
              En gestión
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white">
              <Activity className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {inProgressCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {quotedCount} cotización{quotedCount === 1 ? "" : "es"} sin cerrar
          </p>
        </div>

        {/* Card 3: Hoy */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/80 hover:shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
              Hoy
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {todayCount}
            </span>
            <span className="text-[0.68rem] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              En vivo
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Entradas directas desde la tienda</p>
        </div>

        {/* Card 4: Ventas web */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/80 hover:shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
              Ventas web
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <ShoppingBag className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {salesCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {orders.length} total</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            En listado reciente registrado
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-xl bg-slate-200/70" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por número, cliente, email, teléfono o notas…"
          ariaLabel="Buscar pedidos web"
        />
      </Suspense>

      {/* Barra de Filtros Segmentados SaaS */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 backdrop-blur-sm">
          {TYPE_FILTERS.map((f) => {
            const active = (tipo || "") === f.key;
            return (
              <Link
                key={f.key || "all"}
                href={buildHref({ tipo: f.key || undefined, estado, q: query || undefined })}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs">
          {STATUS_FILTERS.map((f) => {
            const active = (estado || "") === f.key;
            return (
              <Link
                key={f.key || "all-st"}
                href={buildHref({ tipo, estado: f.key || undefined, q: query || undefined })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? "bg-amber-500/15 text-amber-900 font-bold border border-amber-400/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[0.68rem] font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3.5">Pedido</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5">Entrega / Nota</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Factura / Cotiz.</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    {query
                      ? `No hay pedidos para “${query}”`
                      : "No hay pedidos con este filtro"}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const open = isWebOrderPending(o.status);
                  const receipt = extractReceiptFromNotes(o.notes);
                  const isTransfer =
                    o.paymentMode === "TRANSFER" ||
                    o.notes?.includes("Transferencia bancaria");
                  const hasReceiptPending = Boolean(
                    receipt &&
                      o.status !== "PAID" &&
                      o.status !== "DONE" &&
                      o.status !== "CANCELLED",
                  );
                  const hasReceiptApproved = Boolean(
                    receipt && (o.status === "PAID" || o.status === "DONE"),
                  );

                  const isPartialAbono =
                    o.invoice?.status === "PARTIAL" ||
                    o.notes?.includes("Abono parcial") ||
                    o.notes?.includes("Abono inicial");

                  let statusLabel = WEB_STATUS_LABEL[o.status] || o.status;
                  let statusBadgeClass =
                    WEB_STATUS_COLORS[o.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  if (hasReceiptPending) {
                    statusLabel = "Comprobante por validar";
                    statusBadgeClass =
                      "bg-amber-50 text-amber-900 border-amber-300 font-bold ring-2 ring-amber-400/20";
                  } else if (isPartialAbono && o.status === "IN_PROGRESS") {
                    statusLabel = "Abono recibido · En taller";
                    statusBadgeClass =
                      "bg-amber-50 text-amber-950 border-amber-300 font-bold";
                  } else if (o.status === "AWAITING_PAYMENT" && !receipt) {
                    statusLabel = "Esperando comprobante";
                    statusBadgeClass =
                      "bg-sky-50 text-sky-800 border-sky-200";
                  } else if (o.status === "PENDING" && isTransfer) {
                    statusLabel = "Esperando transferencia";
                    statusBadgeClass =
                      "bg-sky-50 text-sky-800 border-sky-200";
                  } else if (o.status === "PENDING" && o.type === "QUOTE") {
                    statusLabel = "Cotización pendiente";
                    statusBadgeClass =
                      "bg-orange-50 text-orange-900 border-orange-200";
                  }

                  const isRetiro = o.notes?.includes("[Retiro en taller]");
                  const isEnvio = o.notes?.includes("[Envío a domicilio]");
                  const rawNoteClean = stripReceiptFromNotes(o.notes)
                    .replace(/\[Pago:[^\]]+\]/g, "")
                    .replace(/\[Retiro en taller\]/g, "")
                    .replace(/\[Envío a domicilio\]/g, "")
                    .replace(/\[CONSULTA\]/g, "")
                    .replace(/\[COTIZACIÓN A MEDIDA\]/g, "")
                    .trim();

                  const wa = o.customerPhone
                    ? whatsappLink(
                        o.customerPhone,
                        `Hola ${o.customerName}, te escribimos de Mudeco Palets sobre tu pedido ${o.number}.`,
                      )
                    : null;

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                        <Link
                          href={`/pedidos-web/${o.id}`}
                          className="font-mono text-sm font-bold text-slate-900 underline-offset-2 hover:underline hover:text-amber-600 transition-colors"
                        >
                          {o.number}
                        </Link>
                        {hasReceiptApproved && !isPartialAbono && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ Pago validado
                            </span>
                          </div>
                        )}
                        {isPartialAbono && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                              ⚡ Abono recibido
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {o.customerName}
                        </p>
                        <p className="text-xs text-slate-500 leading-tight mt-0.5">
                          {o.customerEmail}
                          {o.customerPhone ? ` · ${o.customerPhone}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {webOrderTypeLabel(o)}
                        </span>
                        {o.madeToOrder ? (
                          <span className="ml-1.5 inline-flex items-center rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            🔨 Fabricación
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusBadgeClass}`}
                        >
                          {hasReceiptPending ? (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
                            </span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          )}
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="max-w-[200px] px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-1">
                          {isRetiro && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 border border-stone-200">
                              <Store className="h-3 w-3" />
                              Retiro en taller
                            </span>
                          )}
                          {isEnvio && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                              <Truck className="h-3 w-3" />
                              Envío a domicilio
                            </span>
                          )}
                          {rawNoteClean ? (
                            <span className="line-clamp-2 text-slate-500">
                              {rawNoteClean}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        {o.invoice ? (
                          <Link
                            href={`/facturas/${o.invoice.id}`}
                            className="font-mono font-bold text-amber-700 hover:text-amber-800 hover:underline"
                          >
                            {o.invoice.number}
                          </Link>
                        ) : null}
                        {o.quote ? (
                          <Link
                            href={`/cotizaciones/${o.quote.id}`}
                            className="font-mono font-bold text-sky-700 hover:text-sky-800 hover:underline"
                          >
                            {o.quote.number}
                          </Link>
                        ) : null}
                        {!o.invoice && !o.quote ? (
                          <span className="text-slate-300">—</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasReceiptPending ? (
                            <Link
                              href={`/pedidos-web/${o.id}#comprobante`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 transition active:scale-95"
                              title="Revisar foto del comprobante y confirmar los 3 pasos"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Validar</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/pedidos-web/${o.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                            >
                              <Eye className="h-3 w-3 text-slate-400" />
                              <span>Ver</span>
                            </Link>
                          )}

                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                              title="Contactar al cliente por WhatsApp"
                            >
                              WhatsApp
                            </a>
                          )}

                          {open && (
                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                              {o.status !== "IN_PROGRESS" && (
                                <form
                                  action={markWebOrderInProgress.bind(null, o.id)}
                                >
                                  <button
                                    type="submit"
                                    className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                    title="Marcar pedido en gestión"
                                  >
                                    Gestión
                                  </button>
                                </form>
                              )}
                              <form action={markWebOrderDone.bind(null, o.id)}>
                                <button
                                  type="submit"
                                  className="rounded-md px-2 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  title="Marcar pedido atendido"
                                >
                                Listo
                              </button>
                            </form>
                            <ConfirmForm
                              action={cancelWebOrder.bind(null, o.id)}
                              message={`¿Cancelar el pedido ${o.number}?`}
                            >
                              <button
                                type="submit"
                                className="rounded px-1.5 py-0.5 text-[11px] font-medium text-stone-400 hover:text-red-700 transition"
                                title="Cancelar pedido"
                                aria-label={`Cancelar pedido ${o.number}`}
                              >
                                ✕
                              </button>
                            </ConfirmForm>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
