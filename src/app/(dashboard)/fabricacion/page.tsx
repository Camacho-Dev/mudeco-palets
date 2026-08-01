import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { completeWorkOrder } from "./actions";
import { ConfirmForm } from "@/components/confirm-form";

export default async function FabricacionPage() {
  await requireAdmin();
  const rows = await prisma.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Fabricación"
        description="Órdenes de producción y consumo de materiales"
        action={
          <Link href="/fabricacion/nueva" className="btn btn-primary">
            Nueva orden
          </Link>
        }
      />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Número</th>
              <th>Producto</th>
              <th>Cant</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id}>
                <td>{w.number}</td>
                <td>{w.product.name}</td>
                <td>{w.quantity}</td>
                <td>{w.status}</td>
                <td>{formatDate(w.createdAt)}</td>
                <td>
                  {w.status !== "DONE" ? (
                    <ConfirmForm
                      action={completeWorkOrder.bind(null, w.id)}
                      message="¿Completar fabricación? Descontará materiales y sumará stock."
                    >
                      <button type="submit" className="btn btn-ghost text-xs">
                        Completar
                      </button>
                    </ConfirmForm>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
