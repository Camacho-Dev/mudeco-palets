import Link from "next/link";
import { WebOrdersBell } from "@/components/web-orders-bell";
import { ExternalLink, Zap } from "lucide-react";
import { getCachedPendingWebOrders } from "@/lib/dashboard-cache";
import { prisma } from "@/lib/prisma";

export async function DashboardTopbar() {
  const [{ count: totalPendingCount, recent: pendingOrders }, company] =
    await Promise.all([
      getCachedPendingWebOrders(),
      prisma.companySettings.findUnique({ where: { id: "default" } }),
    ]);

  const companyName = company?.name || "Mudeco Palets";
  const locationText = company?.address
    ? `· ${company.address.split(",")[0].trim()}`
    : "· República Dominicana";

  return (
    <header className="no-print border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-2.5 md:px-10 shadow-2xs transition-all">
      <div className="mx-auto w-full max-w-[1720px] flex items-center justify-between gap-4">
        {/* Lado izquierdo: indicador de estado en vivo */}
        <div className="flex items-center gap-2.5 pl-10 md:pl-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight hidden sm:inline">
            {companyName}
          </span>
          <span className="text-xs font-medium text-slate-400 hidden md:inline">
            {locationText}
          </span>
        </div>

        {/* Lado derecho: Acciones y Campana de Notificaciones */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:text-amber-800 hover:shadow-2xs transition-all"
            title="Abrir tienda pública online"
          >
            <span>Tienda online</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          <Link
            href="/vender"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 hover:shadow-sm active:scale-95 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Generar factura</span>
          </Link>

          {/* Campana de pedidos web interactiva */}
          <WebOrdersBell orders={pendingOrders} totalCount={totalPendingCount} />
        </div>
      </div>
    </header>
  );
}
