"use client";

import Link from "next/link";
import {
  Database,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type {
  WebConnectionCompany,
  WebConnectionStats,
  WebStripeStatus,
} from "./web-connection-types";

export function ConnectionNodesGrid({
  stats,
  company,
  stripeStatus,
  whatsappTestUrl,
  isDiagnosing,
  onDiagnostics,
  isCheckingStripe,
  onCheckStripe,
  isCreatingTest,
  onRequestTestOrder,
}: {
  stats: WebConnectionStats;
  company: WebConnectionCompany;
  stripeStatus: WebStripeStatus;
  whatsappTestUrl: string;
  isDiagnosing: boolean;
  onDiagnostics: () => void;
  isCheckingStripe: boolean;
  onCheckStripe: () => void;
  isCreatingTest: boolean;
  onRequestTestOrder: () => void;
}) {
  return (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* NODO 1: Tienda Pública & ISR */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-brand-gold-strong" />
                  Tienda Pública (Storefront)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Operativo
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Renderizado Next.js con soporte ISR. Muestra productos, precios, fotos, carrito de compras y cotizaciones en tiempo real.
              </p>
              <div className="mt-3 rounded-lg bg-white p-2 text-[0.7rem] border border-[var(--border)] font-mono text-[var(--wood-900)]">
                Ruta principal: <span className="font-bold">/ (Homepage & Catálogo)</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[0.7rem] text-[var(--muted)]">HTTP 200 OK</span>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand-gold-strong hover:underline inline-flex items-center gap-1"
              >
                <span>Visitar vitrina</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* NODO 2: Catálogo & Inventario */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Database className="h-4 w-4 text-brand-gold-strong" />
                  Base de Datos & Catálogo
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Sincronizado
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Los muebles editados en el panel se reflejan inmediatamente en la tienda web con precios, dimensiones, existencias y fotos.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--wood-900)] bg-white p-2 rounded-lg border border-[var(--border)]">
                <span>En tienda: <strong>{stats.activeProducts}</strong></span>
                <span>En stock: <strong>{stats.activeProducts - stats.outOfStockCount}</strong></span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={onDiagnostics}
                disabled={isDiagnosing}
                className="text-xs font-semibold text-brand-gold-strong hover:underline inline-flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                <span>{isDiagnosing ? "Auditando..." : "Diagnosticar catálogo"}</span>
              </button>
              <Link
                href="/productos"
                className="text-xs font-semibold text-[var(--wood-800)] hover:underline"
              >
                Ver productos →
              </Link>
            </div>
          </div>

          {/* NODO 3: Pasarela de Pagos Stripe */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-gold-strong" />
                  Pasarela de Pago (Stripe)
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                    stripeStatus.configured
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      stripeStatus.configured ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {stripeStatus.configured ? stripeStatus.environment : "Sin configurar"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Permite cobros en línea con tarjetas Visa, Mastercard y AMEX. Convierte ventas en facturas y deduce stock automáticamente.
              </p>
              <div className="mt-3 text-[0.7rem] bg-white p-2 rounded-lg border border-[var(--border)] text-[var(--wood-900)]">
                Webhook: <span className="font-mono text-xs">{stripeStatus.webhookUrl}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={onCheckStripe}
                disabled={isCheckingStripe}
                className="text-xs font-semibold text-brand-gold-strong hover:underline"
              >
                {isCheckingStripe ? "Verificando..." : "Test de conexión"}
              </button>
            </div>
          </div>

          {/* NODO 4: Canal WhatsApp Business */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  WhatsApp Directo & Pedidos
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Enlazado
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Canal directo de contacto en la web. Permite a los clientes pedir cotizaciones de muebles a medida o enviar comprobantes de transferencia.
              </p>
              <div className="mt-3 text-xs bg-white p-2 rounded-lg border border-[var(--border)] text-[var(--wood-900)]">
                Línea configurada: <strong>{company?.phone || "No establecida"}</strong>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <a
                href={whatsappTestUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Probar mensaje de WhatsApp</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* NODO 5: Fotos & Contenido CMS */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-brand-gold-strong" />
                  Medias, Portadas & Slider
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Activo
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Control dinámico de Hero Banner, Slider interactivo de Antes & Después, Galería fotográfica y promociones sin tocar código.
              </p>
              <div className="mt-3 text-xs bg-white p-2 rounded-lg border border-[var(--border)] text-[var(--wood-900)] truncate">
                Título: <strong>{company?.heroTitle || "Mudeco Palets"}</strong>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <Link
                href="/contenido-web"
                className="text-xs font-semibold text-brand-gold-strong hover:underline inline-flex items-center gap-1"
              >
                <span>Editar fotos & portadas →</span>
              </Link>
            </div>
          </div>

          {/* NODO 6: Simulador y Trazabilidad */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-brand-gold-strong/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-brand-gold-strong" />
                  Simulador de Integración
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[0.65rem] font-bold text-sky-800 uppercase">
                  Herramienta
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                Genera un pedido web de prueba real en la base de datos para validar cómo ingresan las ventas y verificar la conversión a factura y taller.
              </p>
              <div className="mt-3 text-xs bg-white p-2 rounded-lg border border-[var(--border)] text-[var(--wood-900)]">
                Estado: <strong>Listo para emitir test</strong>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={onRequestTestOrder}
                disabled={isCreatingTest}
                className="text-xs font-semibold text-[var(--wood-900)] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5 text-brand-gold-strong" />
                <span>{isCreatingTest ? "Creando..." : "Crear pedido de prueba"}</span>
              </button>
            </div>
          </div>
        </div>
  );
}
