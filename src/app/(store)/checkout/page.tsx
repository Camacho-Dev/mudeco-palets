import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { Reveal } from "@/components/store/store-motion";
import { CreditCard, Store, FileText, Landmark } from "lucide-react";

export const metadata = { title: "Checkout" };

const baseOptions = [
  {
    href: "/checkout/transferencia",
    title: "Transferencia bancaria",
    desc: "Popular, Banreservas y BHD. Confirmas y subes tu comprobante o lo envías por WhatsApp.",
    icon: Landmark,
    featured: true,
    requiresStripe: false,
  },
  {
    href: "/checkout/local",
    title: "Pagar en el local",
    desc: "Reservamos tu pedido. Pagas al retirar en taller o contra entrega.",
    icon: Store,
    featured: false,
    requiresStripe: false,
  },
  {
    href: "/checkout/pagar",
    title: "Pagar en línea",
    desc: "Pago seguro con tarjeta. Recibes la factura por correo.",
    icon: CreditCard,
    featured: false,
    requiresStripe: true,
  },
  {
    href: "/checkout/cotizar",
    title: "Pedir cotización",
    desc: "Sin pago inmediato. Te enviamos una propuesta formal de presupuesto.",
    icon: FileText,
    featured: false,
    requiresStripe: false,
  },
];

export default async function CheckoutHubPage({
  searchParams,
}: {
  searchParams: Promise<{ cancel?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const stripeReady = isStripeConfigured();
  const options = baseOptions.filter((o) => !o.requiresStripe || stripeReady);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-[0.68rem] font-bold tracking-[0.22em] text-[#b0894f] uppercase">
          Finalizar Pedido
        </p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl text-[var(--wood-950)]">
          ¿Cómo deseas procesar tu orden?
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Selecciona la modalidad de pago o cotización que prefieras.
        </p>
      </Reveal>
      <CancelNote searchParams={searchParams} />
      <div
        className={`mt-8 grid gap-4 sm:grid-cols-2 ${
          options.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
              opt.featured
                ? "border-[#c9a15a] bg-white shadow-xs ring-1 ring-[#c9a15a]/25"
                : "border-[#e2d5c5] bg-white hover:border-[#b0894f]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf6f1] border border-[#e5d8c8] text-[#b0894f]">
                  <opt.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {opt.featured ? (
                  <span className="rounded-full bg-[#c9a15a]/20 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-[#8a6524]">
                    Recomendado
                  </span>
                ) : null}
              </div>
              <h2 className="font-display mt-4 text-xl text-[var(--wood-950)]">
                {opt.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {opt.desc}
              </p>
            </div>
            <p className="mt-6 text-[0.7rem] font-bold tracking-[0.14em] text-[#8a6a3a] uppercase group-hover:underline">
              Seleccionar →
            </p>
          </Link>
        ))}
      </div>
      <Link
        href="/carrito"
        className="mt-8 inline-block text-xs font-semibold text-[var(--muted)] underline-offset-2 hover:text-[var(--wood-950)] hover:underline"
      >
        ← Volver al carrito
      </Link>
    </div>
  );
}

async function CancelNote({
  searchParams,
}: {
  searchParams: Promise<{ cancel?: string }>;
}) {
  const { cancel } = await searchParams;
  if (!cancel) return null;
  return (
    <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      El pago en línea se canceló. Puedes intentar de nuevo o elegir otra opción.
    </p>
  );
}
