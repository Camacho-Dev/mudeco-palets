"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Muestra una barra discreta arriba cuando el navegador pierde conexión a Internet.
 */
export function NetworkStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className="sticky top-0 z-[150] flex items-center justify-center gap-2 bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-sm"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Sin conexión a Internet. Verifica tu red antes de enviar pagos o formularios.</span>
    </div>
  );
}
