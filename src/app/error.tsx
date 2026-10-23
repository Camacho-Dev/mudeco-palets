"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { BrandLogo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Antigravity Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6f1] px-4 py-12 text-center selection:bg-[#c49a5c] selection:text-[#2c1d14]">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="mx-auto flex justify-center">
          <BrandLogo width={180} height={150} tone="onLight" className="h-auto w-40" />
        </div>

        <div className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <span className="inline-block rounded-full bg-amber-200/80 px-4 py-1 text-xs font-bold tracking-widest text-amber-900 uppercase">
            Incidencia Técnica
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#3d2a1f] sm:text-3xl">
            Ocurrió un contratiempo inesperado
          </h1>
          <p className="text-sm text-stone-600 sm:text-base">
            No te preocupes: tus datos y transacciones se encuentran a salvo. Puedes intentar recargar la acción o regresar al panel de control.
          </p>
        </div>

        {error.message ? (
          <div className="rounded-xl bg-stone-100 p-3 text-left text-xs text-stone-700 font-mono overflow-x-auto border border-stone-200 max-h-32">
            {error.message}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#3d2a1f] px-5 py-3 text-sm font-semibold text-[#faf6f1] shadow-md hover:bg-[#2c1d14] transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar operación</span>
          </button>
          <Link
            href="/panel"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#3d2a1f]/20 bg-white px-5 py-3 text-sm font-semibold text-[#3d2a1f] shadow-sm hover:bg-stone-50 transition"
          >
            <Home className="h-4 w-4" />
            <span>Volver al Panel</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-400">
            Mudeco Palets · Sistema Administrativo Integral
          </p>
        </div>
      </div>
    </div>
  );
}
