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
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: LUXURY_EASE }}
      className="overflow-x-clip"
    >
      {children}
    </motion.div>
  );
}
