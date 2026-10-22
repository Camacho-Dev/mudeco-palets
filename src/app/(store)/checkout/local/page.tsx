import { CheckoutForm } from "@/components/store/checkout-form";
import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";

export const metadata = { title: "Pagar en el local" };

export default function CheckoutLocalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Pagar en el local
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Dejamos tu pedido listo. Pagas cuando retires o al recibir.
        </p>
      </Reveal>
      <div className="mt-10">
        <CheckoutForm mode="local" />
      </div>
      <Link href="/checkout" className="mt-6 inline-block text-sm underline">
        Otras opciones
      </Link>
    </div>
  );
}
