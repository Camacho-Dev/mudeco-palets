/** Etiquetas y helpers de pedidos web para el panel */

export type WebServiceKind = "REPAIR" | "CUSTOM_QUOTE" | "CONTACT";

export function serviceKindFromRequest(
  kind: "repair" | "quote" | "contact",
): WebServiceKind {
  if (kind === "repair") return "REPAIR";
  if (kind === "contact") return "CONTACT";
  return "CUSTOM_QUOTE";
}

export function webOrderTypeLabel(order: {
  type: string;
  paymentMode?: string | null;
  serviceKind?: string | null;
  notes?: string | null;
}) {
  const kind =
    order.serviceKind ||
    (order.notes?.includes("[CONSULTA]")
      ? "CONTACT"
      : order.notes?.includes("[COTIZACIÓN A MEDIDA]")
        ? "CUSTOM_QUOTE"
        : null);

  if (kind === "CONTACT") return "Consulta web";
  if (kind === "CUSTOM_QUOTE") return "Cotización a medida";
  if (order.type === "QUOTE") return "Cotización (carrito)";
  if (order.paymentMode === "LOCAL") return "Venta · Pagar en local";
  if (order.paymentMode === "ONLINE") return "Venta · Online";
  return "Venta web";
}

export const WEB_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pagar en local",
  AWAITING_PAYMENT: "Esperando pago web",
  PAID: "Pagado online",
  QUOTED: "Pendiente de respuesta",
  IN_PROGRESS: "En gestión",
  DONE: "Atendido",
  CANCELLED: "Cancelado",
};

export const WEB_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  AWAITING_PAYMENT: "bg-sky-100 text-sky-900",
  PAID: "bg-emerald-100 text-emerald-900",
  QUOTED: "bg-orange-100 text-orange-900",
  IN_PROGRESS: "bg-[#b0894f]/25 text-[var(--wood-900)]",
  DONE: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-stone-100 text-stone-500",
};

export const WEB_STATUS_OPTIONS = [
  { value: "QUOTED", label: "Pendiente de respuesta" },
  { value: "IN_PROGRESS", label: "En gestión" },
  { value: "PENDING", label: "Pagar en local" },
  { value: "AWAITING_PAYMENT", label: "Esperando pago web" },
  { value: "PAID", label: "Pagado online" },
  { value: "DONE", label: "Atendido" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

export function isWebOrderPending(status: string) {
  return ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"].includes(
    status,
  );
}
