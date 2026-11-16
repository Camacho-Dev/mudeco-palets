"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Download,
  Image as ImageIcon,
  Package,
  Search,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  WEB_STATUS_COLORS,
  WEB_STATUS_LABEL,
  webOrderTypeLabel,
} from "@/lib/web-order-labels";
import type { runCatalogDiagnostics } from "./actions";
import type {
  WebConnectionStats,
  WebRecentAudit,
  WebRecentOrder,
} from "./web-connection-types";

export type CatalogDiagnosticResult = Awaited<ReturnType<typeof runCatalogDiagnostics>>;

export function StatsCards({ stats }: { stats: WebConnectionStats }) {
  return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Ventas Web Facturadas
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-[var(--wood-950)]">
            {formatCurrency(stats.totalSalesVolume)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {stats.salesOrders} compras confirmadas
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Bandeja Web Pendiente
            </span>
            <div className="rounded-lg bg-brand-gold-strong/15 p-1.5 text-brand-gold-strong">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-[var(--wood-950)]">
            {stats.pendingOrders}
          </p>
          <p className="mt-1 text-xs text-brand-gold-strong">
            {stats.totalOrders} interacciones totales
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Catálogo Visible
            </span>
            <div className="rounded-lg bg-brand-brown-light/10 p-1.5 text-[var(--wood-800)]">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-[var(--wood-950)]">
            {stats.activeProducts}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            De {stats.totalProducts} muebles registrados
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Salud del Catálogo
            </span>
            <div
              className={`rounded-lg p-1.5 ${
                stats.outOfStockCount > 0 || stats.missingPhotosCount > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {stats.outOfStockCount > 0 || stats.missingPhotosCount > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-[var(--wood-950)]">
            {stats.outOfStockCount === 0 && stats.missingPhotosCount === 0
              ? "100%"
              : `${stats.outOfStockCount + stats.missingPhotosCount} alertas`}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {stats.outOfStockCount} agotados · {stats.missingPhotosCount} sin foto
          </p>
        </div>
      </div>
  );
}

export function DiagnosticReport({ diagnosticResult }: { diagnosticResult: CatalogDiagnosticResult }) {
  return (
        <div className="animate-in fade-in slide-in-from-top-3 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-brand-gold-strong" />
              <h3 className="font-display text-lg font-bold text-[var(--wood-950)]">
                Informe de Diagnóstico del Catálogo Web
              </h3>
            </div>
            <span className="text-xs text-[var(--muted)]">
              Ejecutado: {diagnosticResult.timestamp}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-[#fbf7f2] p-3 border border-[var(--border)]">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">Total productos</span>
              <p className="text-xl font-bold text-[var(--wood-950)] mt-0.5">{diagnosticResult.stats.total}</p>
            </div>
            <div className="rounded-xl bg-[#fbf7f2] p-3 border border-[var(--border)]">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">Activos en tienda</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{diagnosticResult.stats.activeCount}</p>
            </div>
            <div className="rounded-xl bg-[#fbf7f2] p-3 border border-[var(--border)]">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">Agotados (Stock 0)</span>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{diagnosticResult.stats.outOfStockCount}</p>
            </div>
            <div className="rounded-xl bg-[#fbf7f2] p-3 border border-[var(--border)]">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">Sin foto propia</span>
              <p className="text-xl font-bold text-[var(--wood-900)] mt-0.5">{diagnosticResult.stats.withoutImageCount}</p>
            </div>
          </div>

          {diagnosticResult.issues.length === 0 ? (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-sm text-emerald-900">
              ✓ Excelente: No se detectaron anomalías en el catálogo. Todos los productos visibles cuentan con fotos, precio y stock positivo.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {diagnosticResult.issues.map((issue, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 text-xs ${
                    issue.level === "error"
                      ? "border-red-200 bg-red-50/70 text-red-950"
                      : issue.level === "warn"
                        ? "border-amber-200 bg-amber-50/70 text-amber-950"
                        : "border-sky-200 bg-sky-50/70 text-sky-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">{issue.title} ({issue.count})</p>
                    <Link
                      href="/productos"
                      className="underline font-semibold hover:text-black"
                    >
                      Editar en catálogo →
                    </Link>
                  </div>
                  <p className="mt-1 text-xs opacity-80">{issue.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {issue.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/productos/${item.id}`}
                        className="rounded bg-white/80 px-2 py-0.5 text-[0.7rem] font-medium border border-black/10 hover:bg-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  );
}

export function RecentOrdersTable({
  recentOrders,
  totalOrders,
}: {
  recentOrders: WebRecentOrder[];
  totalOrders: number;
}) {
  return (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--brass)] uppercase">
                Bandeja en Tiempo Real
              </p>
              <h3 className="font-display text-lg font-bold text-[var(--wood-950)]">
                Últimos Pedidos e Interacciones Web
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/export/pedidos-web"
                download
                className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
                title="Exportar pedidos en CSV para Excel"
              >
                <Download className="h-3 w-3 text-brand-gold-strong" />
                <span>Exportar CSV</span>
              </a>
              <Link href="/pedidos-web" className="btn btn-secondary text-xs">
                <span>Ver todos ({totalOrders})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[#fbf7f2] uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2.5">Pedido</th>
                  <th className="px-3 py-2.5">Cliente</th>
                  <th className="px-3 py-2.5">Tipo</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5">Monto</th>
                  <th className="px-3 py-2.5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--muted)]">
                      No hay pedidos web registrados todavía
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#fbf7f2]/60 transition">
                      <td className="px-3 py-2.5 font-semibold text-[var(--wood-950)]">
                        <Link href={`/pedidos-web/${o.id}`} className="hover:underline">
                          {o.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-[var(--wood-900)]">{o.customerName}</p>
                        <p className="text-[0.65rem] text-[var(--muted)] truncate max-w-[150px]">
                          {o.customerEmail}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--muted)]">
                        {webOrderTypeLabel(o)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[0.65rem] font-medium ${
                            WEB_STATUS_COLORS[o.status] || "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {WEB_STATUS_LABEL[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-[var(--wood-950)]">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/pedidos-web/${o.id}`}
                          className="rounded border border-[var(--border)] bg-white px-2 py-1 text-[0.7rem] font-medium hover:border-brand-gold-strong"
                        >
                          Gestionar
                        </Link>
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

export function IntegrationSidebar({ recentAudits }: { recentAudits: WebRecentAudit[] }) {
  return (
        <div className="space-y-6">
          {/* ACCIONES RÁPIDAS */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-950)] mb-3">
              Herramientas de Integración
            </h4>
            <div className="space-y-2">
              <Link
                href="/contenido-web"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-brand-gold-strong hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-brand-gold-strong" />
                  <span>Subir Fotos & Portadas</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/productos/nuevo"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-brand-gold-strong hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-gold-strong" />
                  <span>Crear Mueble para Tienda</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/inventario"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-brand-gold-strong hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-brand-gold-strong" />
                  <span>Ajustar Stock de Muebles</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/fabricacion/nueva"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-brand-gold-strong hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-brand-gold-strong" />
                  <span>Orden de Taller para Pedido Web</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>
            </div>
          </div>

          {/* BITÁCORA DE AUDITORÍA WEB */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-950)] mb-3">
              Actividad Reciente en la Web
            </h4>
            <div className="space-y-2.5">
              {recentAudits.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">Sin eventos registrados aún</p>
              ) : (
                recentAudits.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg bg-[#fbf7f2] p-2.5 text-xs border border-[var(--border)]"
                  >
                    <div className="flex items-center justify-between text-[0.65rem] text-[var(--muted)]">
                      <span className="font-semibold uppercase tracking-wider text-[var(--brass)]">
                        {a.action}
                      </span>
                      <span>{formatDate(a.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[var(--wood-900)] leading-snug">
                      {a.summary}
                    </p>
                    {a.userName ? (
                      <p className="mt-0.5 text-[0.65rem] text-[var(--muted)]">
                        Por: {a.userName}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
  );
}
