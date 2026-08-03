import { prisma } from "@/lib/prisma";

export async function getStoreCompany() {
  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  return {
    name: company?.name || "Mudeco Palets",
    slogan: company?.slogan || "Muebles a la medida",
    phone: company?.phone || "+1 (809) 704-7519",
    email: company?.email || "Mudecopalets@gmail.com",
    address:
      company?.address ||
      "Santo Domingo Oeste, Santo Domingo, República Dominicana",
  };
}

export function whatsappLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("1") ? digits : `1${digits}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${normalized}${q}`;
}

export type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  sku: string | null;
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
};
