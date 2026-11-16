import { CartView } from "@/components/store/cart-view";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return <CartView />;
}
