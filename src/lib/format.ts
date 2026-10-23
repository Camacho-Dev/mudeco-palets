export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  PARTIAL: "Pago parcial",
  PAID: "Pagada",
  VOIDED: "Anulada",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  CHECK: "Cheque",
  OTHER: "Otro",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ISSUED: "bg-sky-100 text-sky-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  VOIDED: "bg-rose-100 text-rose-800",
};

export const STOCK_REASON_LABELS: Record<string, string> = {
  SALE: "Venta (Factura)",
  VOID: "Anulación / Reposición",
  PURCHASE: "Compra / Recepción",
  ADJUST: "Ajuste manual",
  MANUFACTURE_IN: "Entrada taller",
  MANUFACTURE_OUT: "Salida taller",
  CREDIT_NOTE: "Nota de crédito",
  WebOrderCancel: "Cancelación web",
};

export const STOCK_REASON_COLORS: Record<string, string> = {
  SALE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  VOID: "bg-rose-100 text-rose-800 border-rose-200",
  PURCHASE: "bg-blue-100 text-blue-800 border-blue-200",
  ADJUST: "bg-amber-100 text-amber-800 border-amber-200",
  MANUFACTURE_IN: "bg-purple-100 text-purple-800 border-purple-200",
  MANUFACTURE_OUT: "bg-stone-100 text-stone-800 border-stone-200",
  CREDIT_NOTE: "bg-indigo-100 text-indigo-800 border-indigo-200",
  WebOrderCancel: "bg-rose-100 text-rose-800 border-rose-200",
};

