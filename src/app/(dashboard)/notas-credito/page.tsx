import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function NotasCreditoPage() {
  await requireAdmin();
  const rows = await prisma.creditNote.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, invoice: true },
    take: 100,
  });
  return (
    <div>
      <PageHeader
        title="Notas de crédito"
        description="Devoluciones y ajustes sobre facturas"
        action={
          <Link href="/notas-credito/nueva" className="btn btn-primary">
            Nueva NC
          </Link>
        }
      />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id}>
                <td>{n.number}</td>
                <td>
                  <Link href={`/facturas/${n.invoiceId}`} className="underline">
                    {n.invoice.number}
                  </Link>
                </td>
                <td>{n.customer.name}</td>
                <td>{formatDate(n.issueDate)}</td>
                <td>{formatCurrency(n.total)}</td>
                <td className="max-w-xs truncate text-sm">{n.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
