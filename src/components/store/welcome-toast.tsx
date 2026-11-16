"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

const STORAGE_KEY = "mudeco:welcome-toast-shown";
const AUTO_DISMISS_MS = 5000;

export function WelcomeToast({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  // Mostrar solo una vez por sesión del navegador
  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(STORAGE_KEY) === "1";
      if (!alreadyShown) window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage no disponible: se muestra igualmente
    }
    if (alreadyShown) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Extract first name for a natural Dominican atelier greeting (e.g. "Brayan")
  const firstName = userName.trim().split(/\s+/)[0] || "Cliente";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          // En móvil se ubica por encima del botón flotante de WhatsApp para no solaparlo
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-40 select-none"
        >
          <div className="flex items-center gap-3 rounded-full border border-brand-gold/35 bg-[#14100e]/95 py-1 pl-4 pr-1 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
            {/* Círculo dorado con check */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold text-[#0f0d0a]">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>

            {/* Texto de bienvenida */}
            <span className="flex-1 text-xs font-medium tracking-wide text-white">
              ¡Bienvenido de nuevo, {firstName}!
            </span>

            {/* Botón cerrar (44×44 px) */}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-gold cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
