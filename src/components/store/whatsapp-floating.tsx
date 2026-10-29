"use client";

import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { whatsappLink } from "@/lib/store";

export function WhatsappFloating({ phone = "+1 (809) 704-7519" }: { phone?: string }) {
  const url = whatsappLink(phone, "Hola Mudeco Palets, me gustaría consultar sobre un mueble o cotización a medida.");

  return (
    <motion.aside
      aria-label="Atención al cliente por WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-2.5 rounded-full border border-[#c9a15a]/40 bg-[#0f0f0f]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#c9a15a] hover:bg-[#161616] hover:shadow-[0_0_24px_rgba(201,161,90,0.3)] hover:-translate-y-0.5"
      >
        {/* Hover halo */}
        <span className="absolute -inset-0.5 -z-10 rounded-full bg-[#c9a15a]/25 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9a15a] text-[#0a0a0a]">
          <MessageSquareText className="h-4 w-4" />
        </div>

        <div className="text-left hidden sm:block">
          <p className="text-[0.62rem] font-medium tracking-wider text-[#c9a15a] uppercase">
            Atención al cliente
          </p>
          <p className="text-xs font-semibold text-white">
            WhatsApp Taller
          </p>
        </div>
      </a>
    </motion.aside>
  );
}
