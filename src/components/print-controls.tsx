"use client";

import Link from "next/link";
import { AutoPrint } from "@/components/auto-print";

export function PrintControls({
  invoiceId,
}: {
  invoiceId: string;
}) {
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
      <Link href={`/facturas/${invoiceId}`} className="btn btn-secondary">
        Ver factura
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
