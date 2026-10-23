"use client";

import { Printer } from "lucide-react";

export function PrintActionButton({
  label = "Imprimir",
  className = "btn btn-secondary",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
      title="Imprimir comprobante o ficha (Ctrl+P)"
    >
      <Printer className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
