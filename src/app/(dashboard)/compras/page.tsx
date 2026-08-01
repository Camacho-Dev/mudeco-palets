import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ComprasPage() {
  await requireAdmin();
  const rows = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true },
    take: 100,
  });
  return (
    <div>
      <PageHeader
        title="Compras"
        description="Órdenes de compra e ingresos de stock"
        action={
          <Link href="/compras/nueva" className="btn btn-primary">
            Nueva compra
          </Link>
        }
      />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/compras/${p.id}`} className="underline">
                    {p.number}
                  </Link>
                </td>
                <td>{p.supplier.name}</td>
                <td>{formatDate(p.orderedAt)}</td>
                <td>{p.status}</td>
                <td>{formatCurrency(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
