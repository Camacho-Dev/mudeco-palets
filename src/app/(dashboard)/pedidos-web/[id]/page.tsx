import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ConfirmForm } from "@/components/confirm-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/store";
import { productImage } from "@/lib/product-image";
import { PrintActionButton } from "@/components/print-action-button";
import { MapPin, Factory, ExternalLink, FileText, CheckCircle2, Clock, Eye } from "lucide-react";
import { extractReceiptFromNotes } from "@/lib/order-receipt";
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
  convertWebOrderDirectToInvoice,
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
      items: {
        include: { product: true },
      },
      customer: true,
      invoice: true,
      quote: true,
    },
  });
  if (!order) notFound();

  const open = isWebOrderPending(order.status);
  const receipt = extractReceiptFromNotes(order.notes);
  const isTransfer = order.notes?.includes("Transferencia bancaria") || order.paymentMode === "TRANSFER";
  const cleanNotes = (order.notes || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
    .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
    .trim();

  const canConvert =
    !!order.quoteId &&
    order.quote &&
    order.quote.status !== "CONVERTED" &&
    !order.invoiceId;

  const waMessage =
    order.type === "SALE"
      ? `Hola ${order.customerName}, te escribimos de Mudeco Palets para dar seguimiento a tu compra web ${order.number} (Total: RD$ ${order.total.toFixed(2)}).`
      : order.serviceKind === "CUSTOM_QUOTE"
        ? `Hola ${order.customerName}, recibimos tu solicitud de mueble a medida ${order.number} en Mudeco Palets. Revisamos los detalles para avanzar con tu diseño.`
        : `Hola ${order.customerName}, te escribimos de Mudeco Palets con relación a tu pedido / consulta ${order.number}.`;

  const wa = order.customerPhone
    ? whatsappLink(order.customerPhone, waMessage)
    : null;

  return (
    <div>
      <PageHeader
        title={order.number}
        description={`${webOrderTypeLabel(order)} · ${formatDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pedidos-web" className="btn btn-ghost text-xs">
              ← Volver
            </Link>
            <PrintActionButton label="Imprimir pedido" className="btn btn-secondary text-xs" />
            {canConvert ? (
              <ConfirmForm
                action={convertWebQuoteToInvoice.bind(null, order.id)}
                message="¿Convertir la cotización de este pedido en factura borrador?"
              >
                <button type="submit" className="btn btn-primary text-xs">
                  Convertir a factura
                </button>
              </ConfirmForm>
            ) : !order.invoiceId ? (
              <ConfirmForm
                action={convertWebOrderDirectToInvoice.bind(null, order.id)}
                message="¿Generar factura borrador oficial en el ERP para este pedido web?"
              >
                <button type="submit" className="btn btn-primary text-xs">
                  Generar factura
                </button>
              </ConfirmForm>
            ) : null}
            {open && order.status !== "IN_PROGRESS" ? (
              <form action={markWebOrderInProgress.bind(null, order.id)}>
                <button type="submit" className="btn btn-secondary text-xs">
                  Marcar en gestión
                </button>
              </form>
            ) : null}
            {open ? (
              <form action={markWebOrderDone.bind(null, order.id)}>
                <button type="submit" className="btn btn-secondary text-xs">
                  Marcar atendido
                </button>
              </form>
            ) : null}
            {open ? (
              <ConfirmForm
                action={cancelWebOrder.bind(null, order.id)}
                message={`¿Cancelar el pedido ${order.number}?`}
              >
                <button type="submit" className="btn btn-ghost text-xs text-red-800">
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
        {order.paymentMode ? (
          <span className="rounded bg-stone-100 px-2 py-0.5 text-[0.65rem] font-semibold text-stone-700 uppercase">
            Pago: {order.paymentMode}
          </span>
        ) : null}
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
            <div className="pt-1">
              <p className="text-xs text-[var(--muted)] font-medium uppercase">Dirección de entrega:</p>
              <p className="text-sm text-[var(--wood-900)] mt-0.5">{order.customerAddress}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#b0894f] hover:underline mt-1"
              >
                <MapPin className="h-3 w-3" />
                <span>Abrir en Google Maps</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-3">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs"
              >
                WhatsApp
              </a>
            ) : null}
            {order.customerEmail ? (
              <a
                href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Pedido ${order.number} · Mudeco Palets`)}`}
                className="btn btn-ghost text-xs"
              >
                Email
              </a>
            ) : null}
            {order.customerPhone ? (
              <a
                href={`tel:${order.customerPhone.replace(/\D/g, "")}`}
                className="btn btn-ghost text-xs"
              >
                Llamar
              </a>
            ) : null}
          </div>

          {order.customerId ? (
            <Link
              href={`/clientes/${order.customerId}`}
              className="inline-block pt-2 text-xs text-[var(--brass)] hover:underline"
            >
              Ver ficha de cliente en ERP →
            </Link>
          ) : null}
        </div>

        <div className="card space-y-3 p-5 text-sm">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Seguimiento ERP & Taller
          </p>
          <p>Tipo: {webOrderTypeLabel(order)}</p>
          <p>Fecha de recepción: {formatDate(order.createdAt)}</p>
          {order.paymentMode ? <p>Modalidad de pago: {order.paymentMode}</p> : null}
          {order.invoice ? (
            <p>
              Factura vinculada:{" "}
              <Link
                href={`/facturas/${order.invoice.id}`}
                className="underline font-semibold text-[var(--wood-800)]"
              >
                {order.invoice.number}
              </Link>{" "}
              ({order.invoice.status})
            </p>
          ) : null}
          {order.quote ? (
            <p>
              Cotización vinculada:{" "}
              <Link
                href={`/cotizaciones/${order.quote.id}`}
                className="underline font-semibold text-[var(--wood-800)]"
              >
                {order.quote.number}
              </Link>{" "}
              ({order.quote.status})
            </p>
          ) : null}
          {!order.invoice && !order.quote ? (
            <p className="text-[var(--muted)]">Sin documento ERP emitido aún</p>
          ) : null}

          {/* Atajo de fabricación */}
          <div className="pt-2 border-t border-[var(--border)]">
            <Link
              href={`/fabricacion/nueva`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:text-[#b0894f]"
              title="Abrir orden de fabricación para este pedido"
            >
              <Factory className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Crear orden de fabricación en taller →</span>
            </Link>
          </div>
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

      {/* Comprobante de pago bancario adjunto por el cliente */}
      {receipt ? (
        <div className="card mb-4 border-2 border-emerald-400 bg-emerald-50/60 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {receipt.mimeType === "application/pdf" || receipt.name.toLowerCase().endsWith(".pdf") ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-sm border border-red-200">
                  <FileText className="h-7 w-7" />
                </div>
              ) : (
                <a
                  href={receipt.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-300 bg-white shadow-sm hover:opacity-90 transition block"
                  title="Abrir imagen de comprobante"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt.url}
                    alt={receipt.name}
                    className="h-full w-full object-cover"
                  />
                </a>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  Comprobante bancario adjunto por el cliente
                </span>
                <p className="mt-1 text-sm font-bold text-[var(--wood-950)] truncate">
                  {receipt.name}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Subido el {new Date(receipt.uploadedAt).toLocaleString("es-DO")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary text-xs inline-flex items-center gap-1.5 bg-white border-emerald-300 shadow-sm text-emerald-950 hover:bg-emerald-50"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-700" />
                <span>Ver comprobante</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      ) : isTransfer ? (
        <div className="card mb-4 border border-amber-300 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <Clock className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              Pago por transferencia bancaria: En espera de que el cliente adjunte comprobante.
            </span>
          </div>
        </div>
      ) : null}

      {cleanNotes ? (
        <div className="card mb-4 p-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Mensaje / historial de notas
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--wood-800)]">
            {cleanNotes}
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
              <th>Foto</th>
              <th>Descripción</th>
              <th>Cant</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)]">
                  Sin líneas de productos (solicitud de servicio / consulta)
                </td>
              </tr>
            ) : (
              order.items.map((it) => {
                const img = it.product ? productImage(it.product) : null;
                return (
                  <tr key={it.id}>
                    <td className="w-14 py-2">
                      {img ? (
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-[var(--border)] bg-[#fbf7f2]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={it.description}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </td>
                    <td>
                      <div className="font-medium text-[var(--wood-900)]">
                        {it.description}
                      </div>
                      {it.product ? (
                        <div className="text-xs text-[var(--muted)]">
                          {it.product.sku ? `SKU: ${it.product.sku} · ` : ""}
                          <a
                            href={`/producto/${it.product.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#b0894f] hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Ver en tienda</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      ) : null}
                    </td>
                    <td>{it.quantity}</td>
                    <td>{formatCurrency(it.unitPrice)}</td>
                    <td className="font-semibold text-[var(--wood-950)]">
                      {formatCurrency(it.lineTotal)}
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
