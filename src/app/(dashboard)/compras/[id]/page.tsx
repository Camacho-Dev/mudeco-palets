import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { receivePurchase } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";

export default async function CompraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.purchase.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { product: true } } },
  });
  if (!p) notFound();

  return (
    <div>
      <PageHeader
        title={p.number}
        description={`${p.supplier.name} · ${formatDate(p.orderedAt)}`}
        action={
          p.status !== "RECEIVED" ? (
            <ConfirmForm
              action={receivePurchase.bind(null, p.id)}
              message="¿Marcar como recibida e incrementar stock?"
            >
              <button type="submit" className="btn btn-primary">
                Recibir mercancía
              </button>
            </ConfirmForm>
          ) : null
        }
      />
      <p className="mb-4 text-sm">
        Estado: <strong>{p.status}</strong> · Total {formatCurrency(p.total)}
      </p>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant</th>
              <th>Costo</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((it) => (
              <tr key={it.id}>
                <td>{it.product.name}</td>
                <td>{it.quantity}</td>
                <td>{formatCurrency(it.unitCost)}</td>
                <td>{formatCurrency(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
