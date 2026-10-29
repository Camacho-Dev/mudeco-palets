"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function LoginPromptBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Si ya está logueado, no mostrar
    if (isLoggedIn) return;

    // Si está en páginas de autenticación o checkout, no mostrar
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/registro") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/pedido/")
    ) {
      return;
    }

    // Verificar si el usuario ya eligió "Más tarde" en esta sesión
    const dismissed = sessionStorage.getItem("mudeco_login_prompt_dismissed");
    if (dismissed === "1") return;

    // Pequeño retardo elegante para que la página cargue primero
    const timer = setTimeout(() => {
      setVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [isLoggedIn, pathname]);

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem("mudeco_login_prompt_dismissed", "1");
  }

  if (!mounted || isLoggedIn) return null;

  return (
    <AnimatePresence>
      {visible && (
        <aside
          role="region"
          aria-label="Aviso de inicio de sesión"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-[94%] max-w-lg pointer-events-auto"
        >
          <motion.div
            initial={{ y: -45, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -35, opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 26,
            }}
            className="relative overflow-hidden rounded-2xl border border-[#c9a15a]/50 bg-[#161412]/95 p-4 sm:p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            {/* Resplandor decorativo dorado superior */}
            <div className="pointer-events-none absolute -top-px left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#c9a15a] to-transparent shadow-[0_0_12px_#c9a15a]" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#c9a15a]/10 blur-2xl" />

            {/* Cabecera del aviso */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a15a]/30 to-[#b0894f]/10 text-[#c9a15a] border border-[#c9a15a]/40 shadow-inner">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                    Mudeco Palets · Bienvenido
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    ¿Deseas iniciar sesión ahora o más tarde?
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition"
                title="Cerrar aviso"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Descripción */}
            <p className="mt-2 text-xs sm:text-[13px] text-white/75 leading-relaxed">
              Inicia sesión para guardar tus muebles favoritos, dar seguimiento a tus pedidos y comprar en un clic. O si prefieres, puedes explorar libremente.
            </p>

            {/* Botones de acción */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                onClick={handleDismiss}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d8b26e] via-[#c9a15a] to-[#b0894f] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#141210] shadow-md shadow-[#c9a15a]/20 hover:brightness-110 active:scale-[0.98] transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Iniciar sesión ahora</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition"
              >
                Más tarde
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-white/40">
              <ShieldCheck className="h-3 w-3 text-[#c9a15a]/70" />
              <span>Puedes explorar todo el catálogo y agregar al carrito sin iniciar sesión</span>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}
