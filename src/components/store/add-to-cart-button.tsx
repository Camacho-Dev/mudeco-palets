"use client";

import { useCart } from "@/components/store/cart-context";
import { productImage } from "@/lib/product-image";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  imageUrl: string | null;
  category: string;
  stock: number;
};

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [msg, setMsg] = useState("");

  const inCart =
    items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max =
    product.stock > 0 ? Math.max(1, Math.floor(product.stock)) : 20;
  const canAdd = inCart < max;

  return (
    <div>
      <button
        type="button"
        className="store-cta store-cta-primary disabled:opacity-50"
        disabled={!canAdd}
        onClick={() => {
          if (!canAdd) {
            setMsg("Cantidad máxima alcanzada");
            return;
          }
          addItem(
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              taxRate: product.taxRate,
              imageUrl: productImage(product),
            },
            1,
            max,
          );
          setMsg("Agregado al carrito");
          setTimeout(() => setMsg(""), 1600);
        }}
      >
        {msg === "Agregado al carrito" ? "Agregado al carrito" : "Agregar al carrito"}
      </button>
      {!canAdd && product.stock > 0 ? (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Ya tienes el máximo disponible en el carrito.
        </p>
      ) : null}
    </div>
  );
}
