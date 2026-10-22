import { CheckoutForm } from "@/components/store/checkout-form";
import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";

export const metadata = { title: "Cotización" };

export default function CheckoutCotizarPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Pedir cotización
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Sin pago. Te contactamos con la propuesta.
        </p>
      </Reveal>
      <div className="mt-10">
        <CheckoutForm mode="quote" />
      </div>
      <Link href="/checkout" className="mt-6 inline-block text-sm underline">
        Otras opciones
      </Link>
    </div>
  );
}
