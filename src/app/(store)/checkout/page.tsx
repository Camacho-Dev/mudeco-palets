import { CheckoutForm } from "@/components/store/checkout-form";
import { isStripeConfigured } from "@/lib/stripe";
import { Reveal } from "@/components/store/store-motion";

export const metadata = { title: "Checkout" };

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancel?: string }>;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Pedido
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Checkout
        </h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Completa tus datos y elige pagar en línea, pagar en el local o pedir
          una cotización.
        </p>
      </Reveal>
      <CheckoutCancelNote searchParams={searchParams} />
      <div className="mt-10">
        <CheckoutForm stripeReady={isStripeConfigured()} />
      </div>
    </div>
  );
}

async function CheckoutCancelNote({
  searchParams,
}: {
  searchParams: Promise<{ cancel?: string }>;
}) {
  const { cancel } = await searchParams;
  if (!cancel) return null;
  return (
    <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      El pago en línea se canceló. Puedes intentar de nuevo o elegir pagar en el
      local.
    </p>
  );
}
