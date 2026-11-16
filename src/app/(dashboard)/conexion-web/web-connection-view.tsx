"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  revalidateWebStoreCache,
  runCatalogDiagnostics,
  checkStripeStatus,
  createDiagnosticWebOrder,
} from "./actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { WebConnectionViewProps } from "./web-connection-types";
import { ConnectionNodesGrid } from "./web-connection-nodes";
import {
  DiagnosticReport,
  IntegrationSidebar,
  RecentOrdersTable,
  StatsCards,
} from "./web-connection-sections";

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
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 rounded-xl border border-brand-gold-strong/40 bg-[#fbf7f2] px-4 py-3 text-sm text-[var(--wood-950)] shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-brand-gold-strong shrink-0" />
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

      <StatsCards stats={stats} />

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
              <Globe className="h-3.5 w-3.5 text-brand-gold-strong" />
              <span>Ver Tienda en Vivo</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        <ConnectionNodesGrid
          stats={stats}
          company={company}
          stripeStatus={stripeStatus}
          whatsappTestUrl={whatsappTestUrl}
          isDiagnosing={isDiagnosing}
          onDiagnostics={handleDiagnostics}
          isCheckingStripe={isCheckingStripe}
          onCheckStripe={handleCheckStripe}
          isCreatingTest={isCreatingTest}
          onRequestTestOrder={() => setConfirmTestOpen(true)}
        />
      </div>

      {/* RESULTADOS DE DIAGNÓSTICO (SI SE HA EJECUTADO) */}
      {diagnosticResult ? (
        <DiagnosticReport diagnosticResult={diagnosticResult} />
      ) : null}

      {/* PEDIDOS WEB RECIENTES Y BITÁCORA */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* TABLA DE PEDIDOS WEB RECIENTES (2 COLUMNAS) */}
        <RecentOrdersTable recentOrders={recentOrders} totalOrders={stats.totalOrders} />

        <IntegrationSidebar recentAudits={recentAudits} />
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
