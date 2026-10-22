import Link from "next/link";
import { Reveal } from "@/components/store/store-motion";
import { CreditCard, Store, FileText, Landmark } from "lucide-react";

export const metadata = { title: "Checkout" };

const options = [
  {
    href: "/checkout/transferencia",
    title: "Transferencia bancaria",
    desc: "Popular, Banreservas y BHD. Confirmas y envías comprobante por WhatsApp.",
    icon: Landmark,
    featured: true,
  },
  {
    href: "/checkout/local",
    title: "Pagar en el local",
    desc: "Reservamos tu pedido. Pagas al retirar en taller o contra entrega.",
    icon: Store,
  },
  {
    href: "/checkout/pagar",
    title: "Pagar en línea",
    desc: "Pago seguro con tarjeta. Recibes la factura por correo.",
    icon: CreditCard,
  },
  {
    href: "/checkout/cotizar",
    title: "Pedir cotización",
    desc: "Sin pago. Te enviamos una propuesta formal de presupuesto.",
    icon: FileText,
  },
];

export default function CheckoutHubPage({
  searchParams,
}: {
  searchParams: Promise<{ cancel?: string }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Pedido
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          ¿Cómo quieres continuar?
        </h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Elige una opción. Cada una abre su propia página.
        </p>
      </Reveal>
      <CancelNote searchParams={searchParams} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className="group border border-[var(--border)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--wood-700)] hover:shadow-md"
          >
            <opt.icon className="h-6 w-6 text-[#b0894f]" strokeWidth={1.75} />
            <h2 className="font-display mt-4 text-xl text-[var(--wood-950)]">
              {opt.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {opt.desc}
            </p>
            <p className="mt-4 text-[0.7rem] font-semibold tracking-[0.12em] text-[var(--wood-800)] uppercase group-hover:underline">
              Continuar →
            </p>
          </Link>
        ))}
      </div>
      <Link
        href="/carrito"
        className="mt-8 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
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
