"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LUXURY_EASE } from "@/components/store/store-motion";

export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}
