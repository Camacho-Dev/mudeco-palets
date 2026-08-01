import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { convertQuoteToInvoice } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";
import { notFound } from "next/navigation";

export default async function CotizacionDetailPage({
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

  return (
    <div>
      <PageHeader
        title={quote.number}
        description={`${quote.customer.name} · ${formatDate(quote.issueDate)}`}
        action={
          quote.status !== "CONVERTED" ? (
            <ConfirmForm
              action={convertQuoteToInvoice.bind(null, quote.id)}
              message="¿Convertir esta cotización en factura borrador?"
            >
              <button type="submit" className="btn btn-primary">
                Convertir a factura
              </button>
            </ConfirmForm>
          ) : (
            <Link href="/facturas" className="btn btn-ghost">
              Ya convertida
            </Link>
          )
        }
      />
      <div className="card mb-4 p-4">
        <p className="text-sm text-[var(--muted)]">Estado: {quote.status}</p>
        <p className="text-lg font-semibold">{formatCurrency(quote.total)}</p>
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
            {quote.items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td>{it.quantity}</td>
                <td>{formatCurrency(it.unitPrice)}</td>
                <td>{formatCurrency(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
