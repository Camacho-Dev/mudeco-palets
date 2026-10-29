import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutStepBanner } from "@/components/store/checkout-step-banner";
import { isStripeConfigured } from "@/lib/stripe";
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
    <div>
      <CheckoutStepBanner
        step={3}
        badge="Checkout · Pago Seguro con Tarjeta"
        title="Pagar en línea"
        subtitle="Completa tus datos de entrega para procesar el pago en línea y recibir tu factura por correo."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <CheckoutForm mode="online" stripeReady={true} />
        <Link
          href="/checkout"
          className="mt-6 inline-block text-xs font-semibold text-[var(--wood-800)] underline-offset-2 hover:underline"
        >
          ← Ver otros métodos de pago
        </Link>
      </div>
    </div>
  );
}
