"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[StoreError]", error.digest || error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[#faf7f2] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#e2d5c5] bg-white p-8 sm:p-10 text-center shadow-[0_20px_50px_-20px_rgba(20,16,13,0.1)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a15a]/35 bg-[#faf7f2]">
          <AlertTriangle className="h-7 w-7 text-[#b0894f]" />
        </div>
        <p className="mt-5 text-[0.65rem] font-bold tracking-[0.22em] text-[#b0894f] uppercase">
          Mudeco Palets · Tienda Online
        </p>
        <h1 className="font-display mt-2 text-3xl text-[#14100d]">
          Ocurrió un inconveniente temporal
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-[#786958]">
          No pudimos cargar esta sección en este momento. Puedes intentar
          recargar o volver al catálogo principal.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[11px] text-[#786958]/70">
            Referencia: {error.digest}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#14100d] px-6 py-3 text-xs font-bold tracking-wider text-[#f5dfa8] uppercase transition hover:bg-[#261e18] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/catalogo"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#e2d5c5] bg-[#faf7f2] px-6 py-3 text-xs font-bold tracking-wider text-[#403227] uppercase transition hover:border-[#c9a15a] hover:bg-white"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Ir al catálogo</span>
          </Link>
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-[#786958] hover:text-[#14100d]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

