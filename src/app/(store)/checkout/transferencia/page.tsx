import { CheckoutForm } from "@/components/store/checkout-form";
import { Reveal } from "@/components/store/store-motion";
import { DOMINICAN_BANKS } from "@/lib/store-info";
import { Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Transferencia bancaria" };

export default function CheckoutTransferenciaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Pago por transferencia bancaria
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Transfiere a cualquiera de nuestras cuentas oficiales y confirma tu pedido.
        </p>
      </Reveal>

      {/* Tarjetas de Cuentas Bancarias */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {DOMINICAN_BANKS.map((b) => (
          <div
            key={b.bank}
            className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#b0894f]" />
              <p className="font-semibold text-sm text-[var(--wood-950)]">
                {b.bank}
              </p>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-[var(--muted)]">
              <p>
                <span className="font-medium text-[var(--wood-950)]">Tipo:</span>{" "}
                {b.type}
              </p>
              <p>
                <span className="font-medium text-[var(--wood-950)]">Cuenta:</span>{" "}
                <span className="font-mono text-sm font-bold text-[var(--wood-950)] selection:bg-[#f3e5d0]">
                  {b.accountNumber}
                </span>
              </p>
              <p>
                <span className="font-medium text-[var(--wood-950)]">Titular:</span>{" "}
                {b.holder}
              </p>
              <p>
                <span className="font-medium text-[var(--wood-950)]">RNC:</span>{" "}
                {b.rnc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#fbf7f2] p-3 text-xs text-[var(--wood-800)] border border-[var(--border)]">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b0894f]" />
        <span>
          Al completar este formulario, tu orden queda registrada y podrás enviarnos el comprobante de pago por WhatsApp con un solo clic.
        </span>
      </div>

      <div className="mt-8">
        <CheckoutForm mode="transfer" />
      </div>

      <Link href="/checkout" className="mt-6 inline-block text-sm underline text-[var(--wood-800)]">
        ← Ver otros métodos de pago
      </Link>
    </div>
  );
}
