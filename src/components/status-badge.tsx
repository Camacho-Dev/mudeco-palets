import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_COLORS[status] || "bg-slate-100 text-slate-700"}`}
    >
      {INVOICE_STATUS_LABELS[status] || status}
    </span>
  );
}
