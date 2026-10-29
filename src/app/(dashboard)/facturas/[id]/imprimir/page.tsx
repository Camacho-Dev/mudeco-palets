import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PrintControls } from "@/components/print-controls";
import { LogoHorizontal } from "@/components/logo";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ImprimirFacturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!invoice) notFound();

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PrintControls invoiceId={id} />

      <article className="card bg-white p-8 md:p-10 print:border-0 print:shadow-none">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-6 border-b-2 border-[var(--brand)] pb-6">
          <div>
            <LogoHorizontal color="#3d2a1f" markClassName="h-12 w-12" />
            <p className="mt-3 text-sm text-[var(--muted)]">
              {company?.slogan || "Muebles a la medida"}
            </p>
            {company?.taxId ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                RNC: {company.taxId}
              </p>
            ) : null}
            {company?.address ? (
              <p className="text-sm text-[var(--muted)]">{company.address}</p>
            ) : null}
            {company?.phone ? (
              <p className="text-sm text-[var(--muted)]">{company.phone}</p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
              Factura
            </p>
            <p className="font-display text-2xl">{invoice.number}</p>
            <p className="mt-2 text-sm">Fecha: {formatDate(invoice.issueDate)}</p>
            {invoice.ncf && !invoice.ncf.startsWith("PENDING:") ? (
              <p className="text-sm">NCF: {invoice.ncf}</p>
            ) : null}
            {invoice.dueDate ? (
              <p className="text-sm">Vence: {formatDate(invoice.dueDate)}</p>
            ) : null}
          </div>
        </header>

        <section className="mb-8">
          <p className="label">Cliente</p>
          <p className="text-lg font-semibold">{invoice.customer.name}</p>
          {invoice.customer.taxId ? (
            <p className="text-sm text-[var(--muted)]">
              RNC/Cédula: {invoice.customer.taxId}
            </p>
          ) : null}
          {invoice.customer.address ? (
            <p className="text-sm text-[var(--muted)]">
              {invoice.customer.address}
            </p>
          ) : null}
          {invoice.customer.phone ? (
            <p className="text-sm text-[var(--muted)]">{invoice.customer.phone}</p>
          ) : null}
        </section>

        <table className="data mb-6 w-full">
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

        <dl className="ml-auto w-56 space-y-1 text-sm">
          <div className="flex justify-between text-[var(--muted)]">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(invoice.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-[var(--muted)]">
            <dt>ITBIS</dt>
            <dd>
              {invoice.applyTax ? formatCurrency(invoice.tax) : "Sin ITBIS"}
            </dd>
          </div>
          {invoice.delivery ? (
            <div className="flex justify-between text-[var(--muted)]">
              <dt>Delivery</dt>
              <dd>{formatCurrency(invoice.deliveryFee)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-display text-lg">
            <dt>Total</dt>
            <dd>{formatCurrency(invoice.total)}</dd>
          </div>
        </dl>

        {invoice.notes ? (
          <p className="mt-8 text-sm text-[var(--muted)]">
            Notas:{" "}
            {invoice.notes
              .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
              .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
              .trim()}
          </p>
        ) : null}

        <footer className="mt-12 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--muted)]">
          Gracias por confiar en Mudeco Palets — muebles fabricados y vendidos
          con calidad.
        </footer>
      </article>
    </div>
  );
}
