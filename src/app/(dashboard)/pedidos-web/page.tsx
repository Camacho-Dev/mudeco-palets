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
  { key: "REPAIR", label: "Reparaciones" },
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
            : `${pendingCount} pendientes · Compras, reparaciones, cotizaciones y consultas`
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
              <th className="px-4 py-3">Resumen</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">ERP</th>
              <th className="px-4 py-3">Acciones</th>
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
                const wa = o.customerPhone
                  ? whatsappLink(
                      o.customerPhone,
                      `Hola ${o.customerName}, te escribimos de Mudeco Palets sobre tu pedido ${o.number}.`,
                    )
                  : null;

                return (
                  <tr
                    key={o.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[#fbf7f2]/70"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/pedidos-web/${o.id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {o.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {o.customerEmail}
                        {o.customerPhone ? ` · ${o.customerPhone}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">{webOrderTypeLabel(o)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          WEB_STATUS_COLORS[o.status] ||
                          "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {WEB_STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3 text-xs text-[var(--muted)]">
                      <span className="line-clamp-2 whitespace-pre-wrap">
                        {(o.notes || "—").replace(/^\[[^\]]+\]\s*/m, "")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {o.invoice ? (
                        <Link
                          href={`/facturas/${o.invoice.id}`}
                          className="block underline"
                        >
                          {o.invoice.number}
                        </Link>
                      ) : null}
                      {o.quote ? (
                        <Link
                          href={`/cotizaciones/${o.quote.id}`}
                          className="block underline"
                        >
                          {o.quote.number}
                        </Link>
                      ) : null}
                      {!o.invoice && !o.quote ? (
                        <span className="text-[var(--muted)]">—</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/pedidos-web/${o.id}`}
                          className="rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium hover:border-[var(--wood-700)]"
                        >
                          Ver
                        </Link>
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                          >
                            WhatsApp
                          </a>
                        ) : o.customerEmail ? (
                          <a
                            href={`mailto:${o.customerEmail}?subject=${encodeURIComponent(`Pedido ${o.number} · Mudeco Palets`)}`}
                            className="rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium hover:border-[var(--wood-700)]"
                          >
                            Email
                          </a>
                        ) : null}
                        {open && o.status !== "IN_PROGRESS" ? (
                          <form
                            action={markWebOrderInProgress.bind(null, o.id)}
                          >
                            <button
                              type="submit"
                              className="rounded-md border border-[#b0894f]/40 bg-[#b0894f]/10 px-2 py-1 text-xs font-medium text-[var(--wood-900)] hover:bg-[#b0894f]/20"
                            >
                              En gestión
                            </button>
                          </form>
                        ) : null}
                        {open ? (
                          <form action={markWebOrderDone.bind(null, o.id)}>
                            <button
                              type="submit"
                              className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                            >
                              Atendido
                            </button>
                          </form>
                        ) : null}
                        {open ? (
                          <ConfirmForm
                            action={cancelWebOrder.bind(null, o.id)}
                            message={`¿Cancelar el pedido ${o.number}?`}
                          >
                            <button
                              type="submit"
                              className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
                            >
                              Cancelar
                            </button>
                          </ConfirmForm>
                        ) : null}
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
