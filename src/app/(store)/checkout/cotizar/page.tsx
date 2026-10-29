import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutStepBanner } from "@/components/store/checkout-step-banner";
import Link from "next/link";

export const metadata = { title: "Cotización" };

export default async function CheckoutCotizarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout/cotizar");
  }

  return (
    <div>
      <CheckoutStepBanner
        step={3}
        badge="Checkout · Solicitud Formal"
        title="Pedir cotización"
        subtitle="Sin pago inmediato. Nuestro taller te envía la propuesta formal con medidas y plazos."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <CheckoutForm mode="quote" />
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
