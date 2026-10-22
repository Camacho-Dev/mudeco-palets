import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ConfirmForm } from "@/components/confirm-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/store";
import {
  WEB_STATUS_COLORS,
  WEB_STATUS_LABEL,
  WEB_STATUS_OPTIONS,
  isWebOrderPending,
  webOrderTypeLabel,
} from "@/lib/web-order-labels";
import {
  addWebOrderStaffNote,
  cancelWebOrder,
  convertWebQuoteToInvoice,
  markWebOrderDone,
  markWebOrderInProgress,
  updateWebOrderStatus,
} from "../actions";

export default async function PedidoWebDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const order = await prisma.webOrder.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      invoice: true,
      quote: true,
    },
  });
  if (!order) notFound();

  const open = isWebOrderPending(order.status);
  const canConvert =
    !!order.quoteId &&
    order.quote &&
    order.quote.status !== "CONVERTED" &&
    !order.invoiceId;

  const wa = order.customerPhone
    ? whatsappLink(
        order.customerPhone,
        `Hola ${order.customerName}, te escribimos de Mudeco Palets sobre tu pedido ${order.number}.`,
      )
    : null;

  return (
    <div>
      <PageHeader
        title={order.number}
        description={`${webOrderTypeLabel(order)} · ${formatDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pedidos-web" className="btn btn-ghost">
              ← Volver
            </Link>
            {canConvert ? (
              <ConfirmForm
                action={convertWebQuoteToInvoice.bind(null, order.id)}
                message="¿Convertir la cotización de este pedido en factura borrador?"
              >
                <button type="submit" className="btn btn-primary">
                  Convertir a factura
                </button>
              </ConfirmForm>
            ) : null}
            {open && order.status !== "IN_PROGRESS" ? (
              <form action={markWebOrderInProgress.bind(null, order.id)}>
                <button type="submit" className="btn btn-secondary">
                  Marcar en gestión
                </button>
              </form>
            ) : null}
            {open ? (
              <form action={markWebOrderDone.bind(null, order.id)}>
                <button type="submit" className="btn btn-secondary">
                  Marcar atendido
                </button>
              </form>
            ) : null}
            {open ? (
              <ConfirmForm
                action={cancelWebOrder.bind(null, order.id)}
                message={`¿Cancelar el pedido ${order.number}?`}
              >
                <button type="submit" className="btn btn-ghost text-red-800">
                  Cancelar pedido
                </button>
              </ConfirmForm>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
            WEB_STATUS_COLORS[order.status] || "bg-stone-100 text-stone-700"
          }`}
        >
          {WEB_STATUS_LABEL[order.status] || order.status}
        </span>
        <span className="rounded-full bg-[#b0894f]/20 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-[var(--wood-800)] uppercase">
          Tienda web
        </span>
        <p className="text-lg font-semibold text-[var(--wood-950)]">
          {formatCurrency(order.total)}
        </p>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-5 text-sm lg:col-span-1">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Cliente
          </p>
          <p className="text-base font-semibold text-[var(--wood-950)]">
            {order.customerName}
          </p>
          <p>{order.customerEmail}</p>
          {order.customerPhone ? <p>{order.customerPhone}</p> : null}
          {order.customerTaxId ? <p>RNC/Céd: {order.customerTaxId}</p> : null}
          {order.customerAddress ? (
            <p className="text-[var(--muted)]">{order.customerAddress}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-3">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                WhatsApp
              </a>
            ) : null}
            {order.customerEmail ? (
              <a
                href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Pedido ${order.number} · Mudeco Palets`)}`}
                className="btn btn-ghost text-sm"
              >
                Email
              </a>
            ) : null}
            {order.customerPhone ? (
              <a
                href={`tel:${order.customerPhone.replace(/\D/g, "")}`}
                className="btn btn-ghost text-sm"
              >
                Llamar
              </a>
            ) : null}
          </div>

          {order.customerId ? (
            <Link
              href={`/clientes/${order.customerId}`}
              className="inline-block pt-2 underline"
            >
              Ver ficha de cliente
            </Link>
          ) : null}
        </div>

        <div className="card space-y-3 p-5 text-sm">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Seguimiento ERP
          </p>
          <p>Tipo: {webOrderTypeLabel(order)}</p>
          <p>Fecha: {formatDate(order.createdAt)}</p>
          {order.paymentMode ? <p>Pago: {order.paymentMode}</p> : null}
          {order.invoice ? (
            <p>
              Factura:{" "}
              <Link
                href={`/facturas/${order.invoice.id}`}
                className="underline"
              >
                {order.invoice.number}
              </Link>{" "}
              ({order.invoice.status})
            </p>
          ) : null}
          {order.quote ? (
            <p>
              Cotización:{" "}
              <Link
                href={`/cotizaciones/${order.quote.id}`}
                className="underline"
              >
                {order.quote.number}
              </Link>{" "}
              ({order.quote.status})
            </p>
          ) : null}
          {!order.invoice && !order.quote ? (
            <p className="text-[var(--muted)]">Sin documento ERP aún</p>
          ) : null}
        </div>

        <div className="card space-y-3 p-5 text-sm">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Cambiar estado
          </p>
          <form
            action={updateWebOrderStatus.bind(null, order.id)}
            className="flex flex-col gap-2"
          >
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {WEB_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary text-sm">
              Guardar estado
            </button>
          </form>
        </div>
      </div>

      {order.notes ? (
        <div className="card mb-4 p-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Mensaje / historial de notas
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--wood-800)]">
            {order.notes}
          </pre>
        </div>
      ) : null}

      <div className="card mb-4 p-5">
        <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          Nota interna del equipo
        </p>
        <form
          action={addWebOrderStaffNote.bind(null, order.id)}
          className="space-y-3"
        >
          <textarea
            name="staffNote"
            rows={3}
            required
            placeholder="Ej. Cliente confirmó medidas por WhatsApp, cotizar con barniz mate…"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className="btn btn-secondary text-sm">
            Agregar nota
          </button>
        </form>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[var(--muted)]">
                  Sin líneas de productos (solicitud de servicio / consulta)
                </td>
              </tr>
            ) : (
              order.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.description}</td>
                  <td>{it.quantity}</td>
                  <td>{formatCurrency(it.unitPrice)}</td>
                  <td>{formatCurrency(it.lineTotal)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
