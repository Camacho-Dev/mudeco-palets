"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error("Dashboard Module Error:", error);
    try {
      const key = "mudeco_dash_autoreload_ts";
      const last = Number(sessionStorage.getItem(key) || "0");
      const now = Date.now();
      // Si acaba de ocurrir un nuevo despliegue en Vercel o un cold-start,
      // recargar automáticamente una vez para sincronizar los chunks y Server Actions.
      if (now - last > 15000) {
        sessionStorage.setItem(key, String(now));
        setReloading(true);
        window.location.reload();
      }
    } catch {
      // ignore storage errors
    }
  }, [error]);

  if (reloading) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white px-5 py-3.5 text-sm font-medium text-stone-700 shadow-xs">
          <RefreshCw className="h-4 w-4 animate-spin text-[#b0894f]" />
          <span>Sincronizando nueva actualización del panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="card p-8 text-center space-y-5 bg-white shadow-sm border border-stone-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--wood-950)]">
            Sincronización pendiente del panel
          </h2>
          <p className="text-sm text-stone-600">
            Se detectó una actualización reciente del servidor o una pausa temporal de conexión. Recarga para continuar con normalidad.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset();
              window.location.reload();
            }}
            className="btn btn-primary inline-flex items-center gap-2 text-sm cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recargar panel</span>
          </button>
          <Link
            href="/panel"
            className="btn btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Ir al Panel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
