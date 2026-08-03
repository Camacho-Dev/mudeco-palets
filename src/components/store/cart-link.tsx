"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex items-center justify-center rounded-sm border border-white/20 p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
      aria-label="Carrito"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={2.25} />
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b0894f] px-1 text-[0.6rem] font-bold text-[#3d2a1f]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
