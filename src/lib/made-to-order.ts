/**
 * Encargos de fabricación.
 *
 * Una pieza se vende "por encargo" cuando no hay suficiente existencia
 * (agotada) o cuando está marcada como "siempre por encargo".
 * El cliente paga un abono inicial de esas piezas y el resto contra entrega;
 * las piezas en existencia se pagan completas.
 *
 * Archivo sin dependencias de servidor: lo usan la tienda, el checkout y el panel.
 */

export type MadeToOrderConfig = {
  leadTimeMinDays: number;
  leadTimeMaxDays: number;
  depositPercent: number;
};

export const DEFAULT_MADE_TO_ORDER: MadeToOrderConfig = {
  leadTimeMinDays: 10,
  leadTimeMaxDays: 15,
  depositPercent: 50,
};

/** Normaliza valores guardados en Empresa a rangos sensatos */
export function normalizeMadeToOrderConfig(
  raw: Partial<MadeToOrderConfig> | null | undefined,
): MadeToOrderConfig {
  const min = clampInt(raw?.leadTimeMinDays, 1, 180, DEFAULT_MADE_TO_ORDER.leadTimeMinDays);
  const max = clampInt(raw?.leadTimeMaxDays, min, 365, Math.max(min, DEFAULT_MADE_TO_ORDER.leadTimeMaxDays));
  const pct = clampInt(raw?.depositPercent, 0, 100, DEFAULT_MADE_TO_ORDER.depositPercent);
  return { leadTimeMinDays: min, leadTimeMaxDays: max, depositPercent: pct };
}

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export type Availability = "in-stock" | "sold-out" | "made-to-order";

type StockLike = { stock: number; madeToOrderOnly?: boolean | null };

/**
 * - in-stock: hay existencia para venderla ya
 * - sold-out: se acabó; se ofrece encargarla
 * - made-to-order: siempre se fabrica por pedido (no es "agotado")
 */
export function availabilityOf(p: StockLike): Availability {
  if (p.madeToOrderOnly) return "made-to-order";
  return p.stock > 0 ? "in-stock" : "sold-out";
}

/** ¿Esta cantidad requiere fabricarse? */
export function needsFabrication(p: StockLike, quantity: number) {
  return Boolean(p.madeToOrderOnly) || p.stock + 0.0001 < quantity;
}

export function leadTimeLabel(cfg: MadeToOrderConfig) {
  return cfg.leadTimeMinDays === cfg.leadTimeMaxDays
    ? `${cfg.leadTimeMinDays} días hábiles`
    : `${cfg.leadTimeMinDays}–${cfg.leadTimeMaxDays} días hábiles`;
}

/** Suma días hábiles (lunes a viernes) */
export function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let left = Math.max(0, Math.round(days));
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left -= 1;
  }
  return d;
}

export function estimatedReadyDate(cfg: MadeToOrderConfig, from = new Date()) {
  return addBusinessDays(from, cfg.leadTimeMaxDays);
}

type PaymentLine = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  madeToOrder: boolean;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Reparte el total entre lo que se paga hoy y lo que queda contra entrega.
 * `total` debe ser el total ya calculado de la factura (con ITBIS), para que
 * lo cobrado cuadre exactamente con la factura.
 */
export function splitPayment(
  lines: PaymentLine[],
  total: number,
  depositPercent: number,
) {
  const gross = (l: PaymentLine) => l.quantity * l.unitPrice * (1 + l.taxRate);
  const mtoGross = lines.filter((l) => l.madeToOrder).reduce((s, l) => s + gross(l), 0);
  const hasMadeToOrder = mtoGross > 0;
  const balance = hasMadeToOrder
    ? round2(mtoGross * (1 - Math.min(100, Math.max(0, depositPercent)) / 100))
    : 0;
  const dueNow = round2(Math.max(0, total - balance));
  return { hasMadeToOrder, dueNow, balance };
}
