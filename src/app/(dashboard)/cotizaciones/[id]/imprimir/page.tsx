import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PrintControls } from "@/components/print-controls";
import { LogoHorizontal } from "@/components/logo";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ImprimirCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!quote) notFound();

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PrintControls quoteId={id} />

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
              Presupuesto / Cotización
            </p>
            <p className="font-display text-2xl">{quote.number}</p>
            <p className="mt-2 text-sm">Fecha: {formatDate(quote.issueDate)}</p>
            {quote.validUntil ? (
              <p className="text-sm text-amber-800 font-medium">
                Válida hasta: {formatDate(quote.validUntil)}
              </p>
            ) : null}
          </div>
        </header>

        <section className="mb-8">
          <p className="label">Cliente</p>
          <p className="text-lg font-semibold">{quote.customer.name}</p>
          {quote.customer.taxId ? (
            <p className="text-sm text-[var(--muted)]">
              RNC/Cédula: {quote.customer.taxId}
            </p>
          ) : null}
          {quote.customer.address ? (
            <p className="text-sm text-[var(--muted)]">
              {quote.customer.address}
            </p>
          ) : null}
          {quote.customer.phone ? (
            <p className="text-sm text-[var(--muted)]">{quote.customer.phone}</p>
          ) : null}
          {quote.customer.email ? (
            <p className="text-sm text-[var(--muted)]">{quote.customer.email}</p>
          ) : null}
        </section>

        <table className="data mb-6 w-full">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Precio Unit.</th>
              <th className="text-right">Importe Estimado</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td className="text-right font-medium">
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.tax > 0 ? (
              <div className="flex justify-between text-[var(--muted)]">
                <span>ITBIS (18%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-lg font-bold text-[var(--wood-950)]">
              <span>Total Estimado</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes ? (
          <div className="mt-8 rounded-lg border border-[var(--border)] bg-[#faf6f1] p-4 text-xs text-[var(--wood-800)]">
            <p className="mb-1 font-semibold uppercase tracking-wider text-[var(--muted)]">
              Términos y Notas del Proyecto
            </p>
            <p className="whitespace-pre-wrap">{quote.notes}</p>
          </div>
        ) : null}

        <footer className="mt-10 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--muted)]">
          <p>
            Mudeco Palets · Muebles artesanales de madera recuperada con alma de taller
          </p>
          <p className="mt-1">
            Este presupuesto es informativo y no constituye una factura fiscal. Confirmar con el taller para programar la fabricación.
          </p>
        </footer>
      </article>
    </div>
  );
}
