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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="store-cta store-cta-primary"
      onClick={() => {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          taxRate: product.taxRate,
          imageUrl: productImage(product),
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
