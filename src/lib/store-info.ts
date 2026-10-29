import { whatsappLink } from "@/lib/store";

/** Datos fijos de taller (logística y confianza en la tienda) */
export const STORE_HOURS = [
  { day: "Lunes a viernes", hours: "9:00 a. m. – 6:00 p. m." },
  { day: "Sábados", hours: "9:00 a. m. – 12:00 p. m." },
  { day: "Domingos", hours: "Cerrado" },
] as const;

export const STORE_LOGISTICS = {
  pickup:
    "Retiro en taller en Santo Domingo Oeste, previa coordinación.",
  delivery:
    "Entrega en Gran Santo Domingo (costo según zona y volumen). Consulta al cotizar o en el checkout.",
  leadTime:
    "Piezas en stock: coordinación en 2–5 días hábiles. A medida: según evaluación.",
  payments:
    "Pago en local (efectivo/transferencia) o en línea con tarjeta cuando esté habilitado.",
  materials:
    "Madera recuperada, acabado artesanal. Cada pieza puede variar ligeramente en veta y tono.",
  care: "Limpia con paño seco o ligeramente húmedo. Evita sol directo prolongado y humedad excesiva.",
} as const;

export function storeWhatsApp(
  phone: string,
  text = "Hola Mudeco Palets, me gustaría más información.",
) {
  return whatsappLink(phone, text);
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "https://mudeco-palets.vercel.app"
  ).replace(/\/$/, "");
}

/** Cuentas bancarias de República Dominicana para transferencias */
export const DOMINICAN_BANKS = [
  {
    bank: "Banco Popular Dominicano",
    type: "Cuenta Corriente en DOP",
    accountNumber: process.env.BANK_POPULAR_ACCOUNT || "794-821903-4",
    holder: "Mudeco Palets SRL",
    rnc: "1-32-45678-9",
    color: "#0047ba",
  },
  {
    bank: "Banreservas (Banco de Reservas)",
    type: "Cuenta de Ahorros en DOP",
    accountNumber: process.env.BANK_BANRESERVAS_ACCOUNT || "960-123456-7",
    holder: "Mudeco Palets SRL",
    rnc: "1-32-45678-9",
    color: "#0072ce",
  },
  {
    bank: "Banco BHD",
    type: "Cuenta Corriente en DOP",
    accountNumber: process.env.BANK_BHD_ACCOUNT || "084-512398-1",
    holder: "Mudeco Palets SRL",
    rnc: "1-32-45678-9",
    color: "#008852",
  },
] as const;

export function getDominicanBanks(company?: {
  name?: string;
  taxId?: string | null;
}) {
  const holder = company?.name || process.env.COMPANY_NAME || "Mudeco Palets SRL";
  const rnc = company?.taxId || process.env.COMPANY_TAX_ID || "1-32-45678-9";
  return [
    {
      bank: "Banco Popular Dominicano",
      type: "Cuenta Corriente en DOP",
      accountNumber: process.env.BANK_POPULAR_ACCOUNT || "794-821903-4",
      holder,
      rnc,
      color: "#0047ba",
    },
    {
      bank: "Banreservas (Banco de Reservas)",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: process.env.BANK_BANRESERVAS_ACCOUNT || "960-123456-7",
      holder,
      rnc,
      color: "#0072ce",
    },
    {
      bank: "Banco BHD",
      type: "Cuenta Corriente en DOP",
      accountNumber: process.env.BANK_BHD_ACCOUNT || "084-512398-1",
      holder,
      rnc,
      color: "#008852",
    },
  ];
}
