import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { ArrowLeft, Printer, FileText, CheckCircle2 } from "lucide-react";

export default async function NotaCreditoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const note = await prisma.creditNote.findUnique({
    where: { id },
    include: {
      customer: true,
      invoice: true,
      user: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!note) notFound();

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Link
          href="/notas-credito"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--wood-900)] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a notas de crédito</span>
        </Link>
      </div>

      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={`Nota de crédito ${note.number}`}
          description={`Emitida el ${formatDate(note.issueDate)} · Aplicada a ${note.invoice.number}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/facturas/${note.invoiceId}`}
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
          >
            <FileText className="h-4 w-4" />
            <span>Ver factura origen</span>
          </Link>
          <WhatsAppShareButton
            customerName={note.customer.name}
            phone={note.customer.phone}
            type="creditNote"
            number={note.number}
            total={note.total}
            invoiceNumber={note.invoice.number}
            companyName={company?.name || "Mudeco Palets"}
          />
          <button
            type="button"
            onClick={undefined}
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
            id="print-nc-btn"
          >
            <Printer className="h-4 w-4" />
            <a href={`javascript:window.print()`} className="contents">
              Imprimir
            </a>
          </button>
        </div>
      </div>

      {/* Tarjeta principal con aspecto de comprobante */}
      <div className="card p-6 md:p-8 space-y-6 bg-white shadow-sm border border-stone-200">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {note.status}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[var(--wood-950)]">
              {note.number}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {company?.name || "Mudeco Palets"} · RNC {company?.taxId || "—"}
            </p>
            {company?.address ? (
              <p className="text-xs text-stone-500">{company.address}</p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Factura asociada
            </p>
            <Link
              href={`/facturas/${note.invoiceId}`}
              className="text-lg font-semibold text-[var(--wood-800)] hover:underline"
            >
              {note.invoice.number}
            </Link>
            {note.invoice.ncf ? (
              <p className="text-xs text-stone-500">NCF: {note.invoice.ncf}</p>
            ) : null}
            <p className="mt-1 text-xs text-stone-500">
              Fecha de emisión: {formatDate(note.issueDate)}
            </p>
          </div>
        </div>

        {/* Cliente y Motivo */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-stone-50 p-4 border border-stone-100">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Cliente acreditado
            </p>
            <p className="mt-1 text-base font-semibold text-stone-900">
              {note.customer.name}
            </p>
            {note.customer.taxId ? (
              <p className="text-xs text-stone-600">
                RNC/Cédula: {note.customer.taxId}
              </p>
            ) : null}
            {note.customer.phone ? (
              <p className="text-xs text-stone-600">
                Tel: {note.customer.phone}
              </p>
            ) : null}
            {note.customer.email ? (
              <p className="text-xs text-stone-600">
                Email: {note.customer.email}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl bg-stone-50 p-4 border border-stone-100">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Motivo del ajuste / devolución
            </p>
            <p className="mt-1 text-sm text-stone-800 whitespace-pre-wrap">
              {note.reason}
            </p>
            <p className="mt-3 text-xs text-stone-400">
              Registrado por: {note.user.name} ({note.user.email})
            </p>
          </div>
        </div>

        {/* Tabla de ítems acreditados */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-stone-900 uppercase tracking-wider">
            Detalle de líneas acreditadas
          </h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cant.</th>
                  <th>Precio unitario</th>
                  <th>ITBIS</th>
                  <th className="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {note.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-stone-500">
                      Ajuste contable global sobre la factura {note.invoice.number}
                    </td>
                  </tr>
                ) : (
                  note.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <span className="font-medium text-stone-900">
                          {it.description}
                        </span>
                        {it.product?.sku ? (
                          <span className="ml-2 text-xs text-stone-400">
                            SKU: {it.product.sku}
                          </span>
                        ) : null}
                      </td>
                      <td>{it.quantity}</td>
                      <td>{formatCurrency(it.unitPrice)}</td>
                      <td>{(it.taxRate * 100).toFixed(0)}%</td>
                      <td className="text-right font-medium">
                        {formatCurrency(it.lineTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de totales */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal acreditado</span>
              <span>{formatCurrency(note.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>ITBIS acreditado</span>
              <span>{formatCurrency(note.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-[var(--wood-950)]">
              <span>Total nota de crédito</span>
              <span>{formatCurrency(note.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
