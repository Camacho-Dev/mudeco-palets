import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatDate } from "@/lib/format";
import { completeWorkOrder, cancelWorkOrder } from "./actions";
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
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron órdenes para “${query}”`
                    : "No hay órdenes de fabricación registradas"}
                </td>
              </tr>
            ) : (
              rows.map((w) => (
                <tr key={w.id}>
                  <td>
                    <Link
                      href={`/fabricacion/${w.id}`}
                      className="font-mono text-xs font-bold text-[var(--wood-900)] hover:text-[var(--accent)] hover:underline"
                    >
                      {w.number}
                    </Link>
                  </td>
                  <td className="font-medium">
                    <Link
                      href={`/fabricacion/${w.id}`}
                      className="hover:underline text-[var(--wood-950)]"
                    >
                      {w.product.name}
                    </Link>
                  </td>
                  <td className="font-semibold text-[var(--wood-950)]">{w.quantity}</td>
                  <td>
                    {w.status === "DONE" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Completada
                      </span>
                    ) : w.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Cancelada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        En producción
                      </span>
                    )}
                  </td>
                  <td className="text-xs text-[var(--muted)]">{formatDate(w.createdAt)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/fabricacion/${w.id}`}
                        className="btn btn-ghost text-xs py-1 px-2.5"
                      >
                        Ver
                      </Link>
                      {w.status === "PENDING" && (
                        <>
                          <ConfirmForm
                            action={completeWorkOrder.bind(null, w.id)}
                            message={`¿Completar fabricación de ${w.quantity} ${w.product.name}? Se descontarán los materiales del almacén y se sumará el stock terminado.`}
                          >
                            <button type="submit" className="btn btn-primary text-xs py-1 px-2.5">
                              Completar
                            </button>
                          </ConfirmForm>
                          <ConfirmForm
                            action={cancelWorkOrder.bind(null, w.id)}
                            message={`¿Cancelar orden de fabricación ${w.number}? No se afectará el inventario.`}
                          >
                            <button type="submit" className="btn btn-ghost text-xs py-1 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                              Cancelar
                            </button>
                          </ConfirmForm>
                        </>
                      )}
                    </div>
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
