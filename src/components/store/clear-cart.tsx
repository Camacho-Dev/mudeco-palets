"use client";

import { useEffect } from "react";
import { useCart } from "@/components/store/cart-context";

export function ClearCartOnSuccess() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
