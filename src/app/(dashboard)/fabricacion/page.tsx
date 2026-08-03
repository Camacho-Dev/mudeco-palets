import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatDate } from "@/lib/format";
import { completeWorkOrder } from "./actions";
import { ConfirmForm } from "@/components/confirm-form";

export default async function FabricacionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const rows = await prisma.workOrder.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { number: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            {
              product: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { sku: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Fabricación"
        description={
          query
            ? `Resultados para “${query}”`
            : "Órdenes de producción y consumo de materiales"
        }
        action={
          <Link href="/fabricacion/nueva" className="btn btn-primary">
            Nueva orden
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por número, producto, SKU o estado…"
          ariaLabel="Buscar órdenes de fabricación"
        />
      </Suspense>

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron órdenes para “${query}”`
                    : "No hay órdenes de fabricación"}
                </td>
              </tr>
            ) : (
              rows.map((w) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
