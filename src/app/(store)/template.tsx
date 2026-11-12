"use client";

import { motion } from "framer-motion";
import { LUXURY_EASE } from "@/components/store/store-motion";

export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}
