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
      initial={reduce ? false : { opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 z-40 select-none"
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#14100e]/95 px-4 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-white/10 transition-all duration-300 hover:border-[#25D366] hover:bg-[#1a1512] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm" aria-hidden>
          <svg
            className="h-4 w-4 fill-current"
            viewBox="0.5 2.2 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.889-9.885 9.889m0-18.316C6.467 3.469 2.006 7.93 2.004 13.407a11.9 11.9 0 001.815 6.345L2 26l6.402-1.68a11.87 11.87 0 005.644 1.428h.005c6.568 0 11.914-5.347 11.917-11.916 0-3.183-1.24-6.177-3.493-8.431A11.85 11.85 0 0012.051 3.47" />
          </svg>
        </div>

        {/* Texto y flecha */}
        <span className="text-xs font-semibold tracking-wide text-white">
          WhatsApp
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#25D366] transition-transform group-hover:translate-x-0.5" />
      </a>
    </motion.aside>
  );
}
