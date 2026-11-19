"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-dvh bg-[#0f0f0f] text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16120e] p-8 text-center space-y-5 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a15a]">
            Mudeco Palets
          </p>
          <h1 className="text-2xl font-semibold">Ocurrió un error inesperado</h1>
          <p className="text-sm text-white/70">
            No pudimos cargar esta vista en este momento. Puedes reintentar o recargar la página.
          </p>
          {error.digest ? (
            <p className="text-[11px] font-mono text-white/50">
              Ref: {error.digest}
            </p>
          ) : null}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-[#c9a15a] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0f0d0a] cursor-pointer"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/85 cursor-pointer"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
