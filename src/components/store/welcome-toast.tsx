"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

export function WelcomeToast({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(true);

  // Extract first name for a natural Dominican atelier greeting (e.g. "Brayan")
  const firstName = userName.trim().split(/\s+/)[0] || "Cliente";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="fixed bottom-6 left-6 z-40 select-none"
        >
          <div className="flex items-center gap-3 rounded-full border border-[#d4af37]/35 bg-[#14100e]/95 px-4 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-white/10">
            {/* Círculo dorado con check */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0f0d0a] shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>

            {/* Texto de bienvenida */}
            <span className="text-xs font-medium tracking-wide text-white">
              ¡Bienvenido de nuevo, {firstName}!
            </span>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

