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

const CATEGORY_FALLBACK: Record<string, string> = {
  default: "/brand/store-craft.jpg",
  sala: "/brand/cat-mesa.jpg",
  comedor: "/brand/cat-mesa.jpg",
  "mesa de centro": "/brand/cat-mesa.jpg",
  "mesa de comedor": "/brand/cat-mesa.jpg",
  "repisa de tv": "/brand/cat-tv.jpg",
  "repisa de entrada": "/brand/cat-tv.jpg",
  muebles: "/brand/store-craft.jpg",
  vinera: "/brand/cat-vinera.jpg",
  dormitorio: "/brand/cat-noche.jpg",
  "mesa de noche": "/brand/cat-noche.jpg",
  "base de cama": "/brand/cat-noche.jpg",
  "base montessori": "/brand/cat-noche.jpg",
  banco: "/brand/cat-banco.jpg",
  butacas: "/brand/cat-banco.jpg",
  "silla haragana": "/brand/cat-banco.jpg",
  gaveteros: "/brand/cat-tv.jpg",
  oficina: "/brand/store-craft.jpg",
  "a medida": "/brand/store-craft.jpg",
};

export function productImage(
  product: { imageUrl?: string | null; category?: string | null; name?: string },
) {
  if (product.imageUrl) return product.imageUrl;
  const cat = (product.category || "").toLowerCase().trim();
  const name = (product.name || "").toLowerCase();
  if (CATEGORY_FALLBACK[cat]) return CATEGORY_FALLBACK[cat];
  for (const [key, src] of Object.entries(CATEGORY_FALLBACK)) {
    if (key !== "default" && (cat.includes(key) || name.includes(key))) {
      return src;
    }
  }
  return CATEGORY_FALLBACK.default;
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
