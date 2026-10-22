"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex h-10 w-10 items-center justify-center border border-[#c9a15a]/55 text-[#c9a15a] transition duration-300 hover:border-[#c9a15a] hover:bg-[#c9a15a]/10"
      aria-label="Carrito"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a15a] px-1 text-[0.6rem] font-bold text-[#0f0f0f]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
