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
    include: {
      customer: true,
      items: true,
      webOrders: {
        select: { id: true, number: true, serviceKind: true },
        take: 5,
      },
    },
  });
  if (!quote) notFound();

  const fromWeb = quote.source === "WEB";

  return (
    <div>
      <PageHeader
        title={quote.number}
        description={`${quote.customer.name} · ${formatDate(quote.issueDate)}${
          fromWeb ? " · Origen WEB" : ""
        }`}
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
      <div className="card mb-4 space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-[var(--muted)]">Estado: {quote.status}</p>
          {fromWeb ? (
            <span className="rounded-full bg-[#b0894f]/20 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-[var(--wood-800)] uppercase">
              Tienda web
            </span>
          ) : (
            <span className="rounded-full bg-[var(--border)] px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-[var(--muted)] uppercase">
              POS
            </span>
          )}
        </div>
        <p className="text-lg font-semibold">{formatCurrency(quote.total)}</p>
        {quote.webOrders[0] ? (
          <p className="text-sm">
            Pedido web:{" "}
            <Link
              href={`/pedidos-web/${quote.webOrders[0].id}`}
              className="underline"
            >
              {quote.webOrders[0].number}
            </Link>
          </p>
        ) : null}
      </div>

      {quote.notes ? (
        <div className="card mb-4 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Notas / mensaje del cliente
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--wood-800)]">
            {quote.notes}
          </pre>
        </div>
      ) : null}

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
