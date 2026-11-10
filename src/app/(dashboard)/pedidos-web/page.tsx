import { Suspense } from "react";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { ConfirmForm } from "@/components/confirm-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/store";
import { ExternalLink, Globe, Image as ImageIcon, Download, Activity, Eye, ShieldCheck } from "lucide-react";
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

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-[0.65rem] font-semibold tracking-wide text-[var(--muted)] uppercase">
            Pendientes
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--wood-950)]">
            {pendingCount}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Incluye en gestión y por responder
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[0.65rem] font-semibold tracking-wide text-[var(--muted)] uppercase">
            En gestión
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--wood-950)]">
            {inProgressCount}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {quotedCount} cotización{quotedCount === 1 ? "" : "es"} sin cerrar
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[0.65rem] font-semibold tracking-wide text-[var(--muted)] uppercase">
            Hoy
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--wood-950)]">
            {todayCount}
          </p>
          <p className="text-xs text-[var(--muted)]">Entradas desde la tienda</p>
        </div>
        <div className="card p-4">
          <p className="text-[0.65rem] font-semibold tracking-wide text-[var(--muted)] uppercase">
            Ventas web
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--wood-950)]">
            {salesCount}
          </p>
          <p className="text-xs text-[var(--muted)]">
            En listado reciente ({orders.length})
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por número, cliente, email, teléfono o notas…"
          ariaLabel="Buscar pedidos web"
        />
      </Suspense>

      <div className="mb-3 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <Link
            key={f.key || "all"}
            href={buildHref({ tipo: f.key || undefined, estado, q: query || undefined })}
            className={`rounded-full border px-3 py-1.5 text-xs tracking-wide uppercase transition ${
              (tipo || "") === f.key
                ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key || "all-st"}
            href={buildHref({ tipo, estado: f.key || undefined, q: query || undefined })}
            className={`rounded-md border px-2.5 py-1 text-xs transition ${
              (estado || "") === f.key
                ? "border-[#b0894f] bg-[#b0894f]/15 font-semibold text-[var(--wood-900)]"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[#fbf7f2] text-xs tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Entrega / Nota</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Factura / Cotiz.</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-[var(--muted)]"
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
                  WEB_STATUS_COLORS[o.status] || "bg-stone-100 text-stone-700";

                if (hasReceiptPending) {
                  statusLabel = "Comprobante por validar";
                  statusBadgeClass =
                    "bg-amber-100 text-amber-900 border border-amber-300 font-semibold";
                } else if (isPartialAbono && o.status === "IN_PROGRESS") {
                  statusLabel = "Abono recibido · En taller";
                  statusBadgeClass =
                    "bg-amber-100 text-amber-950 border border-amber-300 font-semibold";
                } else if (o.status === "AWAITING_PAYMENT" && !receipt) {
                  statusLabel = "Esperando comprobante";
                  statusBadgeClass =
                    "bg-sky-50 text-sky-800 border border-sky-200";
                } else if (o.status === "PENDING" && isTransfer) {
                  statusLabel = "Esperando transferencia";
                  statusBadgeClass =
                    "bg-sky-50 text-sky-800 border border-sky-200";
                } else if (o.status === "PENDING" && o.type === "QUOTE") {
                  statusLabel = "Cotización pendiente";
                  statusBadgeClass =
                    "bg-orange-100 text-orange-900 border border-orange-200";
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
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[#fbf7f2]/70 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <Link
                        href={`/pedidos-web/${o.id}`}
                        className="font-semibold text-[var(--wood-950)] underline-offset-2 hover:underline hover:text-[#b0894f]"
                      >
                        {o.number}
                      </Link>
                      {hasReceiptApproved && !isPartialAbono && (
                        <div className="mt-0.5">
                          <span className="text-[10px] font-semibold text-emerald-800">
                            ✓ Pago validado
                          </span>
                        </div>
                      )}
                      {isPartialAbono && (
                        <div className="mt-0.5">
                          <span className="text-[10px] font-bold text-amber-800">
                            ⚡ Abono inicial (Resta balance)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--wood-950)] leading-tight">
                        {o.customerName}
                      </p>
                      <p className="text-xs text-[var(--muted)] leading-tight mt-0.5">
                        {o.customerEmail}
                        {o.customerPhone ? ` · ${o.customerPhone}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-[var(--wood-900)]">
                        {webOrderTypeLabel(o)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusBadgeClass}`}
                      >
                        {hasReceiptPending && (
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                        )}
                        <span>{statusLabel}</span>
                      </span>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-xs">
                      <div className="flex flex-col gap-1">
                        {isRetiro && (
                          <span className="inline-flex w-fit items-center rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
                            Retiro en taller
                          </span>
                        )}
                        {isEnvio && (
                          <span className="inline-flex w-fit items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            Envío a domicilio
                          </span>
                        )}
                        {rawNoteClean ? (
                          <span className="line-clamp-2 text-[var(--muted)]">
                            {rawNoteClean}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-[var(--wood-950)]">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--muted)]">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {o.invoice ? (
                        <Link
                          href={`/facturas/${o.invoice.id}`}
                          className="font-medium text-[#b0894f] hover:underline"
                        >
                          {o.invoice.number}
                        </Link>
                      ) : null}
                      {o.quote ? (
                        <Link
                          href={`/cotizaciones/${o.quote.id}`}
                          className="font-medium text-[#b0894f] hover:underline"
                        >
                          {o.quote.number}
                        </Link>
                      ) : null}
                      {!o.invoice && !o.quote ? (
                        <span className="text-[var(--muted)]">—</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasReceiptPending ? (
                          <Link
                            href={`/pedidos-web/${o.id}#comprobante`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition"
                            title="Revisar foto del comprobante y confirmar los 3 pasos"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Validar</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/pedidos-web/${o.id}`}
                            className="rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--wood-900)] hover:border-[#b0894f] hover:bg-stone-50 transition"
                          >
                            Ver
                          </Link>
                        )}

                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                            title="Contactar al cliente por WhatsApp"
                          >
                            WhatsApp
                          </a>
                        )}

                        {open && (
                          <div className="inline-flex items-center rounded-md border border-[var(--border)] bg-white p-0.5 shadow-2xs">
                            {o.status !== "IN_PROGRESS" && (
                              <form
                                action={markWebOrderInProgress.bind(null, o.id)}
                              >
                                <button
                                  type="submit"
                                  className="rounded px-2 py-0.5 text-[11px] font-medium text-[var(--wood-800)] hover:bg-[#b0894f]/15 transition"
                                  title="Marcar pedido en gestión"
                                >
                                  Gestión
                                </button>
                              </form>
                            )}
                            <form action={markWebOrderDone.bind(null, o.id)}>
                              <button
                                type="submit"
                                className="rounded px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition"
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
  );
}
