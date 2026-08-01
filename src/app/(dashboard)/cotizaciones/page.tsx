import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function CotizacionesPage() {
  await requireSession();
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Presupuestos convertibles a factura"
        action={
          <Link href="/cotizaciones/nueva" className="btn btn-primary">
            Nueva cotización
          </Link>
        }
      />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id}>
                <td>
                  <Link href={`/cotizaciones/${q.id}`} className="font-medium underline">
                    {q.number}
                  </Link>
                </td>
                <td>{q.customer.name}</td>
                <td>{formatDate(q.issueDate)}</td>
                <td>{q.status}</td>
                <td>{formatCurrency(q.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
