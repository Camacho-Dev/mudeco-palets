"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  revalidateWebStoreCache,
  runCatalogDiagnostics,
  checkStripeStatus,
  createDiagnosticWebOrder,
} from "./actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  WEB_STATUS_COLORS,
  WEB_STATUS_LABEL,
  webOrderTypeLabel,
} from "@/lib/web-order-labels";

interface WebConnectionViewProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    salesOrders: number;
    totalSalesVolume: number;
    totalProducts: number;
    activeProducts: number;
    outOfStockCount: number;
    missingPhotosCount: number;
  };
  company: {
    name: string;
    phone: string | null;
    email: string | null;
    heroTitle: string | null;
    heroImage: string | null;
  } | null;
  stripeStatus: {
    configured: boolean;
    hasWebhookSecret: boolean;
    environment: string;
    webhookUrl: string;
  };
  recentOrders: Array<{
    id: string;
    number: string;
    type: string;
    serviceKind: string | null;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    total: number;
    createdAt: Date;
    invoice: { id: string; number: string } | null;
    quote: { id: string; number: string } | null;
  }>;
  recentAudits: Array<{
    id: string;
    action: string;
    summary: string;
    userName: string | null;
    createdAt: Date;
  }>;
}

export function WebConnectionView({
  stats,
  company,
  stripeStatus: initialStripe,
  recentOrders,
  recentAudits,
}: WebConnectionViewProps) {
  const [isPending, startTransition] = useTransition();
  const [revalidateMsg, setRevalidateMsg] = useState<string | null>(null);
  const [revalidateTime, setRevalidateTime] = useState<string | null>(null);

  const [diagnosticResult, setDiagnosticResult] = useState<Awaited<ReturnType<typeof runCatalogDiagnostics>> | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [stripeStatus, setStripeStatus] = useState(initialStripe);
  const [isCheckingStripe, setIsCheckingStripe] = useState(false);

  const [testOrderResult, setTestOrderResult] = useState<{
    id: string;
    number: string;
    message: string;
  } | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [confirmTestOpen, setConfirmTestOpen] = useState(false);

  // Manejador de revalidación de caché
  function handleRevalidate() {
    startTransition(async () => {
      try {
        const res = await revalidateWebStoreCache();
        setRevalidateMsg(res.message);
        setRevalidateTime(res.timestamp);
        setTimeout(() => setRevalidateMsg(null), 8000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error inesperado";
        setRevalidateMsg(`Error al revalidar: ${msg}`);
      }
    });
  }

  // Manejador de diagnóstico
  async function handleDiagnostics() {
    setIsDiagnosing(true);
    try {
      const res = await runCatalogDiagnostics();
      setDiagnosticResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setRevalidateMsg(`Error en diagnóstico: ${msg}`);
    } finally {
      setIsDiagnosing(false);
    }
  }

  // Manejador de verificación de Stripe
  async function handleCheckStripe() {
    setIsCheckingStripe(true);
    try {
      const res = await checkStripeStatus();
      setStripeStatus(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setRevalidateMsg(`Error verificando Stripe: ${msg}`);
    } finally {
      setIsCheckingStripe(false);
    }
  }

  // Manejador de creación de pedido de prueba
  async function executeCreateTestOrder() {
    setConfirmTestOpen(false);
    setIsCreatingTest(true);
    try {
      const res = await createDiagnosticWebOrder();
      setTestOrderResult({
        id: res.orderId,
        number: res.orderNumber,
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setRevalidateMsg(`Error creando pedido de prueba: ${msg}`);
    } finally {
      setIsCreatingTest(false);
    }
  }

  const rawPhone = company?.phone?.replace(/\D/g, "") || "18097047519";
  const whatsappTestUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(
    `Hola ${company?.name || "Mudeco Palets"}, estoy probando el enlace de conexión web directa con atención al cliente.`
  )}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Alerta de feedback de revalidación */}
      {revalidateMsg ? (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">{revalidateMsg}</p>
              {revalidateTime ? (
                <p className="text-xs text-emerald-700">Completado a las {revalidateTime}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setRevalidateMsg(null)}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Cerrar
          </button>
        </div>
      ) : null}

      {/* Alerta de pedido de prueba creado */}
      {testOrderResult ? (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 rounded-xl border border-[#b0894f]/40 bg-[#fbf7f2] px-4 py-3 text-sm text-[var(--wood-950)] shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[#b0894f] shrink-0" />
            <div>
              <p className="font-semibold">{testOrderResult.message}</p>
              <p className="text-xs text-[var(--muted)]">
                Puedes abrir el pedido para probar notas internas o convertirlo a factura borrador.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/pedidos-web/${testOrderResult.id}`}
              className="btn btn-secondary text-xs"
            >
              Ver pedido {testOrderResult.number} →
            </Link>
            <button
              onClick={() => setTestOrderResult(null)}
              className="text-xs text-[var(--muted)] hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {/* TARJETAS DE INDICADORES GENERALES */}
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
            <div className="rounded-lg bg-[#b0894f]/15 p-1.5 text-[#b0894f]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-[var(--wood-950)]">
            {stats.pendingOrders}
          </p>
          <p className="mt-1 text-xs text-[#b0894f]">
            {stats.totalOrders} interacciones totales
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Catálogo Visible
            </span>
            <div className="rounded-lg bg-[#5c4334]/10 p-1.5 text-[var(--wood-800)]">
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

      {/* MATRIZ DE CONECTIVIDAD DE SISTEMAS Y NODOS */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold tracking-wider text-[var(--brass)] uppercase">
                Arquitectura de Conexión
              </p>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold text-[var(--wood-950)]">
              Estado de Nodos & Servicios de la Web
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRevalidate}
              disabled={isPending}
              className="btn btn-primary inline-flex items-center gap-1.5 text-xs shadow-sm"
              title="Fuerza a Next.js a actualizar todas las páginas de la tienda pública con los datos más recientes"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
              />
              <span>{isPending ? "Sincronizando..." : "Revalidar Tienda Ahora"}</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
            >
              <Globe className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Ver Tienda en Vivo</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* NODO 1: Tienda Pública & ISR */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#b0894f]" />
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
                className="text-xs font-semibold text-[#b0894f] hover:underline inline-flex items-center gap-1"
              >
                <span>Visitar vitrina</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* NODO 2: Catálogo & Inventario */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#b0894f]" />
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
                onClick={handleDiagnostics}
                disabled={isDiagnosing}
                className="text-xs font-semibold text-[#b0894f] hover:underline inline-flex items-center gap-1"
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
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#b0894f]" />
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
                onClick={handleCheckStripe}
                disabled={isCheckingStripe}
                className="text-xs font-semibold text-[#b0894f] hover:underline"
              >
                {isCheckingStripe ? "Verificando..." : "Test de conexión"}
              </button>
            </div>
          </div>

          {/* NODO 4: Canal WhatsApp Business */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
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
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#b0894f]" />
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
                className="text-xs font-semibold text-[#b0894f] hover:underline inline-flex items-center gap-1"
              >
                <span>Editar fotos & portadas →</span>
              </Link>
            </div>
          </div>

          {/* NODO 6: Simulador y Trazabilidad */}
          <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2]/70 p-4 transition hover:border-[#b0894f]/60 hover:bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--wood-950)] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#b0894f]" />
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
                onClick={() => setConfirmTestOpen(true)}
                disabled={isCreatingTest}
                className="text-xs font-semibold text-[var(--wood-900)] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>{isCreatingTest ? "Creando..." : "Crear pedido de prueba"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADOS DE DIAGNÓSTICO (SI SE HA EJECUTADO) */}
      {diagnosticResult ? (
        <div className="animate-in fade-in slide-in-from-top-3 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#b0894f]" />
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
      ) : null}

      {/* PEDIDOS WEB RECIENTES Y BITÁCORA */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* TABLA DE PEDIDOS WEB RECIENTES (2 COLUMNAS) */}
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
                <Download className="h-3 w-3 text-[#b0894f]" />
                <span>Exportar CSV</span>
              </a>
              <Link href="/pedidos-web" className="btn btn-secondary text-xs">
                <span>Ver todos ({stats.totalOrders})</span>
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
                          className="rounded border border-[var(--border)] bg-white px-2 py-1 text-[0.7rem] font-medium hover:border-[#b0894f]"
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

        {/* BITÁCORA Y ACCIONES RÁPIDAS (1 COLUMNA) */}
        <div className="space-y-6">
          {/* ACCIONES RÁPIDAS */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-950)] mb-3">
              Herramientas de Integración
            </h4>
            <div className="space-y-2">
              <Link
                href="/contenido-web"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-[#b0894f] hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#b0894f]" />
                  <span>Subir Fotos & Portadas</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/productos/nuevo"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-[#b0894f] hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#b0894f]" />
                  <span>Crear Mueble para Tienda</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/inventario"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-[#b0894f] hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-[#b0894f]" />
                  <span>Ajustar Stock de Muebles</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>

              <Link
                href="/fabricacion/nueva"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fbf7f2] p-3 text-xs font-medium text-[var(--wood-900)] hover:border-[#b0894f] hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-[#b0894f]" />
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
      </div>

      <ConfirmDialog
        isOpen={confirmTestOpen}
        onClose={() => setConfirmTestOpen(false)}
        onConfirm={executeCreateTestOrder}
        title="Crear pedido web de prueba"
        description="¿Deseas generar un pedido web seguro de prueba en la base de datos? Esto permitirá simular la entrada de una compra online y verificar la bandeja y facturación."
        confirmLabel="Crear pedido test"
        cancelLabel="Cancelar"
        isDestructive={false}
        isPending={isCreatingTest}
      />
    </div>
  );
}
