import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/store/checkout-form";
import { isStripeConfigured } from "@/lib/stripe";
import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";

export const metadata = { title: "Pagar en línea" };

export default async function CheckoutPagarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout/pagar");
  }
  if (!isStripeConfigured()) {
    redirect("/checkout/transferencia");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Pagar en línea
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Completa tus datos para procesar el pago seguro.
        </p>
      </Reveal>
      <div className="mt-10">
        <CheckoutForm mode="online" stripeReady={true} />
      </div>
      <Link href="/checkout" className="mt-6 inline-block text-sm underline">
        ← Ver otros métodos de pago
      </Link>
    </div>
  );
}
