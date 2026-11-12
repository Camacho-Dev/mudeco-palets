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
      className="relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/15 bg-[#14100e]/80 text-[#f5dfa8] transition-all duration-300 hover:border-[#d4af37] hover:bg-[#1a1410] hover:shadow-[0_0_18px_rgba(212,175,55,0.3)] active:scale-95"
      aria-label="Carrito de compras"
      title="Ver carrito de compras"
    >
      <ShoppingBag className="h-4 w-4 text-[#f5dfa8]" strokeWidth={1.8} />
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#0f0d0a] bg-[#d4af37] px-1 text-[0.62rem] font-bold text-[#0f0d0a] shadow-[0_0_10px_rgba(212,175,55,0.6)]"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}
