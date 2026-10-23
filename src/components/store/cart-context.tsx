"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  taxRate: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (
    item: Omit<CartItem, "quantity">,
    qty?: number,
    maxQty?: number,
  ) => boolean;
  setQty: (productId: string, quantity: number, maxQty?: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "mudeco_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1, maxQty?: number): boolean => {
      // Bloqueo estricto: no permitir agregar al carrito si no se ha iniciado sesión
      if (!isAuthenticated) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("mudeco:welcome", {
              detail: { reason: "cart" },
            }),
          );
        }
        return false;
      }

      setItems((prev) => {
        const found = prev.find((p) => p.productId === item.productId);
        if (found) {
          const next = found.quantity + qty;
          const capped =
            maxQty != null ? Math.min(next, maxQty) : next;
          return prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: capped }
              : p,
          );
        }
        const start = maxQty != null ? Math.min(qty, maxQty) : qty;
        return [...prev, { ...item, quantity: start }];
      });
      return true;
    },
    [isAuthenticated],
  );

  const setQty = useCallback(
    (productId: string, quantity: number, maxQty?: number) => {
      setItems((prev) =>
        prev
          .map((p) => {
            if (p.productId !== productId) return p;
            const q =
              maxQty != null
                ? Math.min(Math.max(0, quantity), maxQty)
                : Math.max(0, quantity);
            return { ...p, quantity: q };
          })
          .filter((p) => p.quantity > 0),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { items, count, subtotal, addItem, setQty, removeItem, clear };
  }, [items, addItem, setQty, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
