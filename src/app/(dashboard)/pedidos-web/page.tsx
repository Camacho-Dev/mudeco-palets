import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS: Record<string, string> = {
  PENDING: "Pagar en local",
  AWAITING_PAYMENT: "Esperando pago web",
  PAID: "Pagado online",
  QUOTED: "Cotización",
  CANCELLED: "Cancelado",
};

export default async function PedidosWebPage() {
  await requireSession();
  const orders = await prisma.webOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      invoice: { select: { id: true, number: true, status: true } },
      quote: { select: { id: true, number: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Pedidos web"
        description="Compras y cotizaciones que llegan desde la tienda online"
      />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[#fbf7f2] text-xs tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">ERP</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[var(--muted)]"
                >
                  Aún no hay pedidos desde la web
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{o.number}</td>
                  <td className="px-4 py-3">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {o.customerEmail}
                      {o.customerPhone ? ` · ${o.customerPhone}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {o.type === "QUOTE" ? "Cotización" : "Venta"}
                    {o.paymentMode === "LOCAL"
                      ? " · Local"
                      : o.paymentMode === "ONLINE"
                        ? " · Online"
                        : ""}
                  </td>
                  <td className="px-4 py-3">
                    {STATUS[o.status] || o.status}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    {o.invoice ? (
                      <Link
                        href={`/facturas/${o.invoice.id}`}
                        className="underline"
                      >
                        {o.invoice.number}
                      </Link>
                    ) : null}
                    {o.quote ? (
                      <Link
                        href={`/cotizaciones/${o.quote.id}`}
                        className="underline"
                      >
                        {o.quote.number}
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
