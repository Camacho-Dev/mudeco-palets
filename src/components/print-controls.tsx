"use client";

import Link from "next/link";
import { AutoPrint } from "@/components/auto-print";

export function PrintControls({
  invoiceId,
  quoteId,
  backHref,
  backLabel,
}: {
  invoiceId?: string;
  quoteId?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const targetHref =
    backHref ||
    (quoteId
      ? `/cotizaciones/${quoteId}`
      : invoiceId
        ? `/facturas/${invoiceId}`
        : "/");
  const targetLabel =
    backLabel || (quoteId ? "Ver cotización" : "Ver factura");

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <AutoPrint />
      <button
        type="button"
        onClick={() => window.print()}
        className="btn btn-accent"
      >
        Imprimir de nuevo
      </button>
      <Link href={targetHref} className="btn btn-secondary">
        {targetLabel}
      </Link>
      <Link href="/vender" className="btn btn-primary">
        Nueva venta
      </Link>
      <p className="text-sm text-[var(--muted)]">
        Si no salió el diálogo, usa el botón o Ctrl+P
      </p>
    </div>
  );
}
