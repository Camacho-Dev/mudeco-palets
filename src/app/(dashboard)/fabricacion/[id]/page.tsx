import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { completeWorkOrder, cancelWorkOrder } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";
import { PrintActionButton } from "@/components/print-action-button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Ruler,
  User,
  Calendar,
  ArrowLeft,
} from "lucide-react";

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!wo) notFound();

  // Check material availability for pending orders
  const materialReadiness = wo.items.map((item) => {
    const available = item.product.stock;
    const required = item.quantity;
    const isSufficient = available >= required;
    const missing = Math.max(0, required - available);
    const unitCost = item.product.cost;
    const lineCost = required * unitCost;

    return {
      ...item,
      available,
      required,
      isSufficient,
      missing,
      unitCost,
      lineCost,
    };
  });

  const allMaterialsAvailable = materialReadiness.every((m) => m.isSufficient);
  const totalMaterialCost = materialReadiness.reduce(
    (acc, m) => acc + m.lineCost,
    0,
  );
  const unitMaterialCost =
    wo.quantity > 0 ? totalMaterialCost / wo.quantity : 0;

  const dims = [
    wo.product.widthCm ? `${wo.product.widthCm} ancho` : null,
    wo.product.heightCm ? `${wo.product.heightCm} alto` : null,
    wo.product.depthCm ? `${wo.product.depthCm} prof.` : null,
  ]
    .filter(Boolean)
    .join(" × ");

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/fabricacion"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[var(--muted)] uppercase transition hover:text-[var(--wood-900)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Fabricación
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <PrintActionButton
            label="Imprimir Ficha de Taller"
            className="btn btn-secondary text-xs"
          />

          {wo.status === "PENDING" && (
            <>
              <ConfirmForm
                action={cancelWorkOrder.bind(null, wo.id)}
                title="Cancelar orden de fabricación"
                message={`¿Deseas cancelar la orden ${wo.number}? No se afectará el inventario.`}
                confirmLabel="Sí, cancelar orden"
                isDestructive={true}
              >
                <button
                  type="submit"
                  className="btn btn-ghost text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Cancelar orden
                </button>
              </ConfirmForm>

              <ConfirmForm
                action={completeWorkOrder.bind(null, wo.id)}
                title="Completar fabricación"
                message={`¿Confirmas que se completó la fabricación de ${wo.quantity} ${wo.product.unit} de "${wo.product.name}"? Se descontarán los materiales consumidos del inventario y se incrementará el stock del mueble terminado.`}
                confirmLabel="Sí, completar fabricación"
              >
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                  disabled={!allMaterialsAvailable}
                  title={
                    !allMaterialsAvailable
                      ? "Hay materiales con stock insuficiente en el almacén"
                      : "Completar producción y descontar materiales"
                  }
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Completar orden
                </button>
              </ConfirmForm>
            </>
          )}
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="card p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-[var(--wood-950)]">
                {wo.number}
              </span>
              {wo.status === "DONE" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Fabricación Completada
                </span>
              ) : wo.status === "CANCELLED" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  Orden Cancelada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  En Producción (Taller)
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Orden de carpintería y ensamblado artesanal con madera de palets
              recuperada
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[var(--wood-700)]" />
              <span>Creada: {formatDate(wo.createdAt)}</span>
            </div>
            {wo.completedAt && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Completada: {formatDate(wo.completedAt)}</span>
              </div>
            )}
            {wo.user && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[var(--wood-700)]" />
                <span>Encargado: {wo.user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 grid gap-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-5 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-[0.68rem] font-bold tracking-wider text-[var(--muted)] uppercase">
              Mueble a fabricar
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <Link
                href={`/productos/${wo.productId}`}
                className="font-display text-lg font-bold text-[var(--wood-950)] hover:text-[var(--accent)] hover:underline"
              >
                {wo.product.name}
              </Link>
              {wo.product.sku && (
                <span className="font-mono text-xs text-[var(--muted)]">
                  SKU: {wo.product.sku}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Categoría: {wo.product.category}
            </p>
            {wo.product.description && (
              <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                {wo.product.description}
              </p>
            )}
          </div>

          <div>
            <p className="text-[0.68rem] font-bold tracking-wider text-[var(--muted)] uppercase">
              Cantidad Ordenada
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--wood-900)]">
              {wo.quantity}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">
                {wo.product.unit}
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Stock actual en almacén:{" "}
              <span className="font-semibold text-stone-700">
                {wo.product.stock} {wo.product.unit}
              </span>
            </p>
          </div>

          <div>
            <p className="text-[0.68rem] font-bold tracking-wider text-[var(--muted)] uppercase">
              Medidas de Taller
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
              <Ruler className="h-4 w-4 text-[var(--wood-700)]" />
              {dims || "A convenir / estándar"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Precio venta catálogo:{" "}
              <span className="font-semibold text-stone-700">
                {formatCurrency(wo.product.price)}
              </span>
            </p>
          </div>
        </div>

        {wo.notes && (
          <div className="mt-4 rounded-lg bg-amber-50/70 p-4 border border-amber-200/60 text-xs text-amber-950">
            <span className="font-semibold">Notas e instrucciones de taller:</span>{" "}
            {wo.notes}
          </div>
        )}
      </div>

      {/* Bill of Materials (BOM) Section */}
      <div className="card p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-[var(--wood-950)]">
              <Layers className="h-4 w-4 text-[var(--wood-800)]" />
              Receta de Materiales e Insumos Consumidos
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Lista de materiales requeridos para producir {wo.quantity}{" "}
              {wo.product.unit} de {wo.product.name}
            </p>
          </div>

          {wo.status === "PENDING" && (
            <div className="flex items-center gap-2">
              {allMaterialsAvailable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Todos los materiales disponibles en almacén
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Atención: stock insuficiente en algunos materiales
                </span>
              )}
            </div>
          )}
        </div>

        <div className="table-wrap mt-4">
          <table className="data">
            <thead>
              <tr>
                <th>Material / Insumo</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th className="text-right">Por Unidad</th>
                <th className="text-right">Total Requerido</th>
                <th className="text-right">Stock en Almacén</th>
                <th>Disponibilidad</th>
                <th className="text-right">Costo Est.</th>
              </tr>
            </thead>
            <tbody>
              {materialReadiness.map((m) => (
                <tr key={m.id}>
                  <td className="font-medium text-[var(--wood-950)]">
                    <Link
                      href={`/materiales/${m.productId}`}
                      className="hover:underline"
                    >
                      {m.product.name}
                    </Link>
                  </td>
                  <td className="font-mono text-xs text-[var(--muted)]">
                    {m.product.sku || "—"}
                  </td>
                  <td className="text-xs text-[var(--muted)]">
                    {m.product.category}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {(m.required / (wo.quantity || 1)).toFixed(2)}{" "}
                    {m.product.unit}
                  </td>
                  <td className="text-right font-mono text-sm font-bold text-[var(--wood-950)]">
                    {m.required} {m.product.unit}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {m.available} {m.product.unit}
                  </td>
                  <td>
                    {m.isSufficient ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Faltan {m.missing.toFixed(1)} {m.product.unit}
                      </span>
                    )}
                  </td>
                  <td className="text-right font-mono text-xs font-semibold">
                    {formatCurrency(m.lineCost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 font-bold">
                <td colSpan={7} className="text-right text-xs uppercase tracking-wider text-[var(--muted)]">
                  Costo Total Estimado en Materiales:
                </td>
                <td className="text-right font-mono text-sm text-[var(--wood-950)]">
                  {formatCurrency(totalMaterialCost)}
                </td>
              </tr>
              <tr>
                <td colSpan={7} className="text-right text-xs uppercase tracking-wider text-[var(--muted)]">
                  Costo de Materiales por Unidad Terminada:
                </td>
                <td className="text-right font-mono text-xs text-[var(--wood-800)]">
                  {formatCurrency(unitMaterialCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Workshop Printable Guidelines (Hidden on screen, optimized for print) */}
      <div className="hidden print:block text-xs text-stone-700 mt-8 pt-6 border-t border-stone-300 space-y-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold uppercase tracking-wider">Firma de Carpintero / Operador:</p>
            <div className="mt-8 border-b border-black w-3/4"></div>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider">Control de Calidad / Aprobado por:</p>
            <div className="mt-8 border-b border-black w-3/4"></div>
          </div>
        </div>
        <p className="text-[10px] text-stone-500 text-center pt-4">
          Mudeco Palets — Hoja de Control de Producción Artesanal en Taller
        </p>
      </div>
    </div>
  );
}
