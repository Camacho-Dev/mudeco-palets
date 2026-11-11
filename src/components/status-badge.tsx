import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${INVOICE_STATUS_COLORS[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {INVOICE_STATUS_LABELS[status] || status}
    </span>
  );
}
