"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Module Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="card p-8 text-center space-y-5 bg-white shadow-sm border border-stone-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--wood-950)]">
            No se pudo completar la operación
          </h2>
          <p className="text-sm text-stone-600">
            {error.message ||
              "Ocurrió un error al cargar los datos del módulo. Los registros de la base de datos no sufrieron alteraciones."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
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
