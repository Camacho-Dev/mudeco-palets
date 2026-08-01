import { roundMoney } from "@/lib/format";

export type LineInput = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export function calcLine(line: LineInput, applyTax = true) {
  const subtotal = roundMoney(line.quantity * line.unitPrice);
  const rate = applyTax ? line.taxRate : 0;
  const tax = roundMoney(subtotal * rate);
  const total = roundMoney(subtotal + tax);
  return { subtotal, tax, total, lineTotal: subtotal };
}

export function calcInvoiceTotals(
  lines: LineInput[],
  opts: { deliveryFee?: number; applyTax?: boolean } = {},
) {
  const applyTax = opts.applyTax !== false;
  const deliveryFee = roundMoney(Math.max(0, opts.deliveryFee || 0));

  let subtotal = 0;
  let tax = 0;

  for (const line of lines) {
    const c = calcLine(line, applyTax);
    subtotal += c.subtotal;
    tax += c.tax;
  }

  return {
    subtotal: roundMoney(subtotal),
    tax: roundMoney(tax),
    deliveryFee,
    applyTax,
    total: roundMoney(subtotal + tax + deliveryFee),
  };
}

export function paidAmount(
  payments: { amount: number }[],
): number {
  return roundMoney(payments.reduce((s, p) => s + p.amount, 0));
}

export function resolvePaymentStatus(
  total: number,
  paid: number,
  current: string,
): string {
  if (current === "VOIDED" || current === "DRAFT") return current;
  if (paid <= 0) return "ISSUED";
  if (paid + 0.001 >= total) return "PAID";
  return "PARTIAL";
}

export function parseDeliveryFromForm(fd: FormData) {
  const enabled =
    fd.get("delivery") === "on" ||
    fd.get("delivery") === "true" ||
    fd.get("delivery") === "1";
  const raw = Number(fd.get("deliveryFee") || 0);
  const deliveryFee = enabled && Number.isFinite(raw) && raw > 0 ? raw : 0;
  return {
    delivery: enabled,
    deliveryFee: roundMoney(deliveryFee),
  };
}

/** Explicit true/false from form; default true si no viene el campo */
export function parseTaxFromForm(fd: FormData) {
  const raw = fd.get("applyTax");
  if (raw === null || raw === undefined || raw === "") return true;
  return raw === "on" || raw === "true" || raw === "1";
}
