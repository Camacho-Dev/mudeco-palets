import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { receivePurchase, cancelPurchase } from "../actions";
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
        description={`Proveedor: ${p.supplier.name} · Solicitada el ${formatDate(p.orderedAt)}`}
        action={
          p.status === "ORDERED" ? (
            <div className="flex items-center gap-2">
              <ConfirmForm
                action={receivePurchase.bind(null, p.id)}
                message={`¿Marcar compra ${p.number} como recibida? Se aumentará el stock de ${p.items.length} artículos y se actualizará su costo unitario.`}
              >
                <button type="submit" className="btn btn-primary">
                  Recibir mercancía
                </button>
              </ConfirmForm>
              <ConfirmForm
                action={cancelPurchase.bind(null, p.id)}
                message={`¿Cancelar compra ${p.number}? No afectará el inventario.`}
              >
                <button type="submit" className="btn btn-danger">
                  Cancelar orden
                </button>
              </ConfirmForm>
            </div>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {p.status === "RECEIVED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Recibida en almacén {p.receivedAt ? `(${formatDate(p.receivedAt)})` : ""}
          </span>
        ) : p.status === "CANCELLED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Orden cancelada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Ordenada · Esperando entrega
          </span>
        )}
        <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-[var(--wood-900)]">
          Total: {formatCurrency(p.total)}
        </span>
        {p.supplier.phone ? (
          <span className="text-xs text-[var(--muted)]">Tel: {p.supplier.phone}</span>
        ) : null}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Producto / Insumo</th>
              <th>Cantidad</th>
              <th>Costo Unitario</th>
              <th className="text-right">Importe Total</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((it) => (
              <tr key={it.id}>
                <td>
                  <span className="font-medium text-[var(--wood-950)]">{it.product.name}</span>
                  {it.product.sku ? (
                    <span className="block font-mono text-xs text-[var(--muted)]">
                      SKU: {it.product.sku}
                    </span>
                  ) : null}
                </td>
                <td className="font-semibold text-[var(--wood-900)]">
                  {it.quantity} {it.product.unit || "unid."}
                </td>
                <td>{formatCurrency(it.unitCost)}</td>
                <td className="text-right font-bold text-[var(--wood-950)]">
                  {formatCurrency(it.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
