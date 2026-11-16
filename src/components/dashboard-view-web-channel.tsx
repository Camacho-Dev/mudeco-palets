"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  MessageSquare,
  Package,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";
import type { BusinessAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/motion";

export function WebChannelPanel({ data }: { data: BusinessAnalytics }) {
  const { kpis } = data;
  return (
    <>
      <FadeIn delay={0.06}>
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brass)] uppercase">
                  Canal Web · Tienda Online
                </p>
              </div>
              <h2 className="font-display mt-0.5 text-xl text-[var(--wood-950)]">
                Pedidos, cotizaciones y solicitudes recibidas
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/conexion-web"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold-strong/40 bg-brand-gold-strong/15 px-3 py-1.5 text-xs font-semibold text-[var(--wood-900)] hover:border-brand-gold-strong hover:bg-brand-gold-strong/25 transition shadow-sm"
                title="Centro de Control, Diagnóstico y Sincronización de la Conexión Web"
              >
                <Globe className="h-3.5 w-3.5 text-brand-gold-strong" />
                <span>Conexión Web</span>
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[#fbf7f2] px-3 py-1.5 text-xs font-medium text-[var(--wood-800)] hover:border-brand-gold-strong hover:bg-white"
                title="Muebles activos visibles en tienda"
              >
                <Package className="h-3.5 w-3.5 text-brand-gold-strong" />
                <span>{kpis.productCount} en catálogo</span>
              </Link>
              <Link
                href="/contenido-web"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[#fbf7f2] px-3 py-1.5 text-xs font-medium text-[var(--wood-800)] hover:border-brand-gold-strong hover:bg-white"
                title="Fotos de portada, transformaciones y galería"
              >
                <ImageIcon className="h-3.5 w-3.5 text-brand-gold-strong" />
                <span>Fotos web</span>
              </Link>
              <Link href="/pedidos-web" className="btn btn-secondary text-xs">
                <span>Bandeja completa</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/pedidos-web?estado=pending"
              className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-strong hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase group-hover:text-[var(--wood-900)]">
                  Pendientes
                </span>
                <div className="rounded-lg bg-brand-gold-strong/15 p-1.5 text-brand-gold-strong transition-transform group-hover:scale-110">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)]">
                {kpis.webPendingCount}
              </p>
              <p className="mt-2 text-xs font-medium text-brand-gold-strong group-hover:underline">
                Por atender →
              </p>
            </Link>

            <Link
              href="/pedidos-web?tipo=CUSTOM_QUOTE"
              className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-strong hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase group-hover:text-[var(--wood-900)]">
                  Cotizaciones
                </span>
                <div className="rounded-lg bg-brand-brown-light/10 p-1.5 text-[var(--wood-800)] transition-transform group-hover:scale-110">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)]">
                {kpis.webCustomQuotesCount || kpis.webQuotesCount}
              </p>
              <p className="mt-2 text-xs font-medium text-brand-gold-strong group-hover:underline">
                A medida →
              </p>
            </Link>

            <Link
              href="/pedidos-web?tipo=CONTACT"
              className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-strong hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase group-hover:text-[var(--wood-900)]">
                  Consultas
                </span>
                <div className="rounded-lg bg-brand-brown-light/10 p-1.5 text-[var(--wood-800)] transition-transform group-hover:scale-110">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)]">
                {kpis.webContactsCount}
              </p>
              <p className="mt-2 text-xs font-medium text-brand-gold-strong group-hover:underline">
                Mensajes recibidos →
              </p>
            </Link>

            <Link
              href="/pedidos-web?tipo=sale"
              className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-strong hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase group-hover:text-[var(--wood-900)]">
                  Ventas web
                </span>
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-700 transition-transform group-hover:scale-110">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)]">
                {kpis.webSalesCount}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-700 group-hover:underline">
                Compras confirmadas →
              </p>
            </Link>
          </div>

          {/* Métricas secundarias de rendimiento web */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-[var(--border)] pt-3 text-xs">
            <div className="rounded-lg bg-[#fbf7f2] p-2.5">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">
                Facturación web
              </span>
              <p className="font-semibold text-[var(--wood-900)] mt-0.5">
                {formatCurrency(kpis.webSalesVolume)}
              </p>
            </div>
            <div className="rounded-lg bg-[#fbf7f2] p-2.5">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">
                A medida / Proyectos VIP
              </span>
              <p className="font-semibold text-[var(--wood-900)] mt-0.5">
                {kpis.webCustomQuotesCount} solicitudes
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-[#fbf7f2] p-2.5">
              <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase">
                Tasa de atención
              </span>
              <p className="font-semibold text-[var(--wood-900)] mt-0.5">
                {kpis.webDoneCount} atendidos ({kpis.webConversionRate}%)
              </p>
            </div>
          </div>

          {/* Barra de estado de conexión */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 px-3 py-2 text-[0.7rem] text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                Conexión en vivo activa: Catálogo, stock de inventario, pasarela
                Stripe y contenidos multimedia sincronizados
              </span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>Abrir tienda</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {data.recentWebOrders?.length ? (
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="mb-2 text-[0.68rem] font-semibold tracking-wider text-[var(--muted)] uppercase">
                Últimos pedidos recibidos desde la tienda
              </p>
              <ul className="divide-y divide-[var(--border)]">
                {data.recentWebOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm transition hover:bg-[#fbf7f2]/80 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/pedidos-web/${o.id}`}
                        className="font-semibold text-[var(--wood-900)] underline-offset-2 hover:underline"
                      >
                        {o.number}
                      </Link>
                      <span className="text-xs text-[var(--muted)]">
                        · {o.customerName}
                      </span>
                      {o.serviceKind ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.62rem] font-medium text-amber-900">
                          {o.serviceKind === "CUSTOM_QUOTE"
                            ? "A medida"
                            : o.serviceKind === "CONTACT"
                              ? "Consulta"
                              : "Web"}
                        </span>
                      ) : (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[0.62rem] font-medium text-stone-800">
                          {o.type === "SALE" ? "Compra" : "Cotiz. Carrito"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--wood-950)]">
                        {formatCurrency(o.total)}
                      </span>
                      <Link
                        href={`/pedidos-web/${o.id}`}
                        className="text-xs font-medium text-[var(--brass)] hover:underline"
                      >
                        Gestionar →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </FadeIn>
    </>
  );
}
