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
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://mudeco-palets-smoky.vercel.app")
  ).replace(/\/$/, "");
}

const DEMO_RNC_PLACEHOLDERS = new Set([
  "1-32-45678-9",
  "132456789",
  "130000000",
  "1-30-00000-0",
]);

function resolveCleanRnc(taxId?: string | null) {
  const raw = (taxId || process.env.COMPANY_TAX_ID || "").trim();
  if (!raw || DEMO_RNC_PLACEHOLDERS.has(raw)) {
    return "";
  }
  return raw;
}

export type DominicanBankAccount = {
  bank: string;
  type: string;
  accountNumber: string;
  holder: string;
  rnc?: string;
  color?: string;
};

/** Obtiene las cuentas bancarias oficiales configuradas en la BD (CompanySettings) o variables de entorno */
export function getDominicanBanks(company?: {
  name?: string;
  taxId?: string | null;
  bankAccountsJson?: string | null;
}): DominicanBankAccount[] {
  // 1. Cuentas reales guardadas en la base de datos desde el panel de Configuración
  if (company?.bankAccountsJson) {
    try {
      const parsed = JSON.parse(company.bankAccountsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(
          (b: DominicanBankAccount) => b && b.bank && b.accountNumber?.trim()
        );
        if (valid.length > 0) return valid;
      }
    } catch {
      /* fallback */
    }
  }

  // 2. Fallback a variables de entorno oficiales si están definidas
  const holder = process.env.BANK_ACCOUNT_HOLDER || company?.name || "Mudeco Palets SRL";
  const rnc = resolveCleanRnc(company?.taxId);

  const envBanks: DominicanBankAccount[] = [];
  if (process.env.BANK_POPULAR_ACCOUNT) {
    envBanks.push({
      bank: "Banco Popular Dominicano",
      type: "Cuenta Corriente en DOP",
      accountNumber: process.env.BANK_POPULAR_ACCOUNT,
      holder,
      rnc,
      color: "#0047ba",
    });
  }
  if (process.env.BANK_BANRESERVAS_ACCOUNT) {
    envBanks.push({
      bank: "Banreservas (Banco de Reservas)",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: process.env.BANK_BANRESERVAS_ACCOUNT,
      holder,
      rnc,
      color: "#0072ce",
    });
  }
  if (process.env.BANK_BHD_ACCOUNT) {
    envBanks.push({
      bank: "Banco BHD",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: process.env.BANK_BHD_ACCOUNT,
      holder,
      rnc,
      color: "#008852",
    });
  }
  if (process.env.BANK_APAP_ACCOUNT) {
    envBanks.push({
      bank: "Asociación Popular (APAP)",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: process.env.BANK_APAP_ACCOUNT,
      holder,
      rnc,
      color: "#d97706",
    });
  }
  if (process.env.BANK_BANESCO_ACCOUNT) {
    envBanks.push({
      bank: "Banesco Banco Múltiple",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: process.env.BANK_BANESCO_ACCOUNT,
      holder,
      rnc,
      color: "#006940",
    });
  }

  if (envBanks.length > 0) {
    return envBanks;
  }

  // Cuentas oficiales de Mudeco Palets a nombre de Martín González
  return [
    {
      bank: "Banco Popular Dominicano",
      type: "Cuenta Corriente en DOP",
      accountNumber: "0854076668",
      holder: "Martín González",
      rnc,
      color: "#0047ba",
    },
    {
      bank: "Banreservas (Banco de Reservas)",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: "9609158003",
      holder: "Martín González",
      rnc,
      color: "#0072ce",
    },
    {
      bank: "Banco BHD",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: "14660720010",
      holder: "Martín González",
      rnc,
      color: "#008852",
    },
    {
      bank: "Asociación Popular (APAP)",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: "1020930098",
      holder: "Martín González",
      rnc,
      color: "#d97706",
    },
    {
      bank: "Banesco Banco Múltiple",
      type: "Cuenta de Ahorros en DOP",
      accountNumber: "11200066282",
      holder: "Martín González",
      rnc,
      color: "#006940",
    },
  ];
}
