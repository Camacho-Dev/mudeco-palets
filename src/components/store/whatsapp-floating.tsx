"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/store";

export function WhatsappFloating({
  phone = "+1 (809) 704-7519",
}: {
  phone?: string;
}) {
  const url = whatsappLink(
    phone,
    "Hola Mudeco Palets, me gustaría consultar sobre un mueble o cotización a medida.",
  );

  const reduce = useReducedMotion();

  return (
    <motion.aside
      aria-label="Atención al cliente por WhatsApp"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#14100e]/95 py-2 pl-2.5 pr-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-white/10 transition-all duration-300 hover:border-[#25D366] hover:bg-[#1a1512] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
      >
        <svg
          viewBox="0 0 32 32"
          className="h-7 w-7 shrink-0 drop-shadow-sm"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="16" fill="#25D366" />
          <path
            d="M16 6.8c-5.08 0-9.2 4.02-9.2 8.98 0 1.66.46 3.28 1.34 4.69L7 25l4.74-1.22a9.33 9.33 0 0 0 4.26 1.02c5.08 0 9.2-4.02 9.2-8.98 0-4.96-4.12-9.02-9.2-9.02Zm0 16.25c-1.36 0-2.69-.37-3.85-1.08l-.28-.17-2.81.72.75-2.67-.18-.28a7.2 7.2 0 0 1-1.15-3.93c0-3.96 3.28-7.18 7.32-7.18 4.04 0 7.32 3.22 7.32 7.18 0 3.96-3.28 7.41-7.12 7.41Z"
            fill="#ffffff"
          />
          <path
            d="M20.06 17.85c-.22-.11-1.31-.65-1.51-.72-.2-.07-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.17-.48.06-.22-.11-.94-.35-1.79-1.1-.66-.59-1.11-1.32-1.24-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43c-.15 0-.39.06-.59.28-.2.22-.78.76-.78 1.85 0 1.09.8 2.15.91 2.3.11.15 1.56 2.39 3.79 3.35.53.23.94.37 1.26.47.53.17 1.01.15 1.39.09.42-.06 1.31-.54 1.49-1.06.18-.52.18-.96.13-1.06-.06-.09-.2-.15-.42-.26Z"
            fill="#ffffff"
          />
        </svg>

        <span className="text-xs font-semibold tracking-wide text-white">
          WhatsApp
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#25D366] transition-transform group-hover:translate-x-0.5" />
      </a>
    </motion.aside>
  );
}
