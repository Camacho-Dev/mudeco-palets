"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, ScrollText, ShoppingCart } from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { FadeIn } from "@/components/motion";

export function DashboardAlerts({ data }: { data: BusinessAnalytics }) {
  const { kpis } = data;
  return (
    <>
      {kpis.lowStockCount > 0 ? (
        <FadeIn delay={0.05}>
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                Stock bajo en {kpis.lowStockCount} mueble(s) terminado(s)
              </p>
              <p className="text-amber-800/80">
                {kpis.lowStockNames.join(", ")}
                {kpis.lowStockCount > 4 ? "…" : ""}
                {" · "}
                <Link
                  href="/inventario"
                  className="underline font-medium hover:text-amber-950"
                >
                  Ver inventario de muebles
                </Link>
              </p>
            </div>
          </div>
        </FadeIn>
      ) : null}

      {kpis.lowStockMaterialsCount > 0 ? (
        <FadeIn delay={0.055}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-950 shadow-sm">
            <div className="flex items-start gap-3">
              <Boxes className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-900">
                  Alerta de Taller: {kpis.lowStockMaterialsCount} insumo(s) bajo
                  el stock mínimo
                </p>
                <p className="text-xs text-rose-800/80">
                  {kpis.lowStockMaterialsNames.join(", ")}
                  {kpis.lowStockMaterialsCount > 4 ? "…" : ""}
                  {" · "}
                  <Link
                    href="/materiales"
                    className="underline font-medium hover:text-rose-950"
                  >
                    Ver almacén de materiales
                  </Link>
                </p>
              </div>
            </div>
            <Link
              href="/compras/nueva"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-800 transition"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Crear orden de compra</span>
            </Link>
          </div>
        </FadeIn>
      ) : null}

      {kpis.ncfAlertsCount > 0 ? (
        <FadeIn delay={0.058}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <div className="flex items-start gap-3">
              <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold text-amber-900">
                  Aviso DGII: Secuencia de comprobantes fiscales por vencer o
                  agotarse ({kpis.ncfAlertsCount})
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-amber-800">
                  {kpis.ncfAlerts.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-2 py-0.5 font-medium"
                    >
                      <strong>{a.type}</strong> ({a.name}):{" "}
                      {a.isExpired
                        ? "¡VENCIDO!"
                        : a.isExpiringSoon
                          ? "Vence pronto"
                          : ""}
                      {a.isLow ? ` · Quedan ${a.remaining}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/configuracion"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-900 transition"
            >
              <span>Gestionar NCF</span>
            </Link>
          </div>
        </FadeIn>
      ) : null}
    </>
  );
}
