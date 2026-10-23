"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { motion, AnimatePresence } from "framer-motion";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex h-10 w-10 items-center justify-center border border-[#c9a15a]/55 text-[#c9a15a] transition duration-300 hover:border-[#c9a15a] hover:bg-[#c9a15a]/10 hover:shadow-[0_0_15px_rgba(201,161,90,0.25)]"
      aria-label="Carrito"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a15a] px-1 text-[0.6rem] font-bold text-[#0f0f0f] shadow-[0_0_8px_rgba(201,161,90,0.6)]"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}

