import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutStepBanner } from "@/components/store/checkout-step-banner";
import { BankAccountsGrid } from "@/components/store/bank-accounts-grid";
import { getDominicanBanks } from "@/lib/store-info";
import { getStoreCompany } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Transferencia bancaria" };

export default async function CheckoutTransferenciaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout/transferencia");
  }

  const company = await getStoreCompany();
  const banks = getDominicanBanks(company);

  return (
    <div>
      <CheckoutStepBanner
        step={3}
        badge="Checkout · Transferencia Bancaria"
        title="Pago por transferencia bancaria"
        subtitle="Copia cualquiera de nuestras cuentas oficiales en DOP, confirma tu pedido y sube tu comprobante en el siguiente paso."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <BankAccountsGrid banks={banks} />

        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#fbf7f2] p-3.5 text-xs text-[var(--wood-800)] border border-[#e2d5c5]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b0894f]" />
          <span>
            Al completar este formulario, tu orden queda registrada y podrás adjuntar el comprobante bancario desde el resumen de tu pedido.
          </span>
        </div>

        <div className="mt-8">
          <CheckoutForm mode="transfer" />
        </div>

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
