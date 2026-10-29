import Link from "next/link";
import { WebOrdersBell } from "@/components/web-orders-bell";
import { ExternalLink, Zap } from "lucide-react";
import { getCachedPendingWebOrders } from "@/lib/dashboard-cache";

export async function DashboardTopbar() {
  const { recent: pendingOrders } = await getCachedPendingWebOrders();

  return (
    <header className="no-print border-b border-[var(--border)] bg-white/70 backdrop-blur-md sticky top-0 z-30 px-6 py-2.5 md:px-10">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
        {/* Lado izquierdo: indicador de estado o atajo rápido */}
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-[var(--wood-900)] hidden sm:inline">
            Taller Mudeco Palets
          </span>
          <span className="text-xs text-[var(--muted)] hidden md:inline">
            · República Dominicana
          </span>
        </div>

        {/* Lado derecho: Acciones y Campana de Notificaciones */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#fbf7f2] px-3 py-1.5 text-xs font-medium text-[var(--wood-800)] hover:border-[#b0894f] hover:bg-white transition"
            title="Abrir tienda pública online"
          >
            <span>Tienda online</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          <Link
            href="/vender"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--wood-950)] px-3 py-1.5 text-xs font-semibold text-[#faf6f1] shadow-sm hover:bg-[var(--wood-800)] transition"
          >
            <Zap className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Generar factura</span>
          </Link>

          {/* Campana de pedidos web interactiva */}
          <WebOrdersBell orders={pendingOrders} />
        </div>
      </div>
    </header>
  );
}
