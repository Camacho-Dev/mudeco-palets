import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { paidAmount } from "@/lib/invoice-calc";
import { issueInvoice, voidInvoice } from "../actions";
import { PaymentForm } from "@/components/payment-form";
import { createPayment, deletePayment } from "../../pagos/actions";
import { ConfirmForm } from "@/components/confirm-form";
import { isAdmin } from "@/lib/rbac";

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const admin = isAdmin(session.user.role);

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { paidAt: "desc" } },
      user: true,
    },
  });
  if (!invoice) notFound();

  const paid = paidAmount(invoice.payments);
  const balance = Math.round((invoice.total - paid) * 100) / 100;
  const canPay =
    ["ISSUED", "PARTIAL"].includes(invoice.status) && balance > 0;

  const issue = issueInvoice.bind(null, id);
  const voidAction = voidInvoice.bind(null, id);
  const pay = createPayment.bind(null, id);

  return (
    <div>
      <PageHeader
        title={invoice.number}
        description={`Cliente: ${invoice.customer.name}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={invoice.status} />
        {invoice.ncf ? (
          <span className="text-sm text-slate-500">NCF: {invoice.ncf}</span>
        ) : null}
        {invoice.delivery ? (
          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
            Delivery · {formatCurrency(invoice.deliveryFee)}
          </span>
        ) : null}
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            invoice.applyTax
              ? "bg-emerald-50 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {invoice.applyTax ? "Con ITBIS" : "Sin ITBIS"}
        </span>
        <span className="text-sm text-slate-500">
          {formatDate(invoice.issueDate)}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link href={`/facturas/${invoice.id}/imprimir`} className="btn btn-accent">
            Imprimir
          </Link>
          <a
            href={`/api/facturas/${invoice.id}/pdf`}
            className="btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            Descargar PDF
          </a>
          {invoice.status === "DRAFT" ? (
            <>
              <Link href={`/facturas/${id}/editar`} className="btn btn-secondary">
                Editar
              </Link>
              <form action={issue}>
                <button type="submit" className="btn btn-primary">
                  Emitir
                </button>
              </form>
            </>
          ) : null}
          {["ISSUED", "PARTIAL", "PAID"].includes(invoice.status) && admin ? (
            <ConfirmForm
              action={voidAction}
              message="¿Anular esta factura? Se repondrá stock y se eliminarán los pagos."
            >
              <button type="submit" className="btn btn-danger">
                Anular
              </button>
            </ConfirmForm>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-medium text-slate-800">Detalle</h2>
            <div className="table-wrap border-0 shadow-none">
              <table className="data">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>ITBIS</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{(item.taxRate * 100).toFixed(0)}%</td>
                      <td>{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-4 ml-auto w-56 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(invoice.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>ITBIS</dt>
                <dd>
                  {invoice.applyTax
                    ? formatCurrency(invoice.tax)
                    : "Sin ITBIS"}
                </dd>
              </div>
              {invoice.delivery ? (
                <div className="flex justify-between text-slate-500">
                  <dt>Delivery</dt>
                  <dd>{formatCurrency(invoice.deliveryFee)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(invoice.total)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>Pagado</dt>
                <dd>{formatCurrency(paid)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-[#1a4d40]">
                <dt>Saldo</dt>
                <dd>{formatCurrency(balance)}</dd>
              </div>
            </dl>
          </div>

          {invoice.notes ? (
            <div className="card p-6 text-sm text-slate-600">
              <h2 className="mb-2 font-medium text-slate-800">Notas</h2>
              {invoice.notes}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-3 font-medium text-slate-800">Cliente</h2>
            <p className="font-medium">{invoice.customer.name}</p>
            {invoice.customer.taxId ? (
              <p className="text-sm text-slate-500">
                RNC: {invoice.customer.taxId}
              </p>
            ) : null}
            {invoice.customer.address ? (
              <p className="mt-2 text-sm text-slate-500">
                {invoice.customer.address}
              </p>
            ) : null}
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-medium text-slate-800">Pagos</h2>
            {invoice.payments.length === 0 ? (
              <p className="mb-4 text-sm text-slate-500">Sin pagos registrados</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {invoice.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0"
                  >
                    <div>
                      <div className="font-medium">
                        {formatCurrency(p.amount)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(p.paidAt)} ·{" "}
                        {PAYMENT_METHOD_LABELS[p.method] || p.method}
                      </div>
                    </div>
                    {admin ? (
                      <ConfirmForm
                        action={deletePayment.bind(null, p.id)}
                        message="¿Eliminar este pago?"
                      >
                        <button type="submit" className="text-xs text-rose-600">
                          Quitar
                        </button>
                      </ConfirmForm>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {canPay ? (
              <PaymentForm action={pay} maxAmount={balance} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
