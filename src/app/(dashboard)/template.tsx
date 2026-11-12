"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

/** Entrada suave de cada pantalla del panel al navegar */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  // Las vistas de impresión se imprimen solas al cargar: nunca deben
  // arrancar invisibles.
  const skip = reduce || pathname.endsWith("/imprimir");

  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
