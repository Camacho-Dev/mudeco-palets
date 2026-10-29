import { prisma, withDbRetry } from "@/lib/prisma";
import { productImage } from "@/lib/product-image";

export { productImage };

export type StoreCompany = {
  name: string;
  slogan: string;
  taxId: string | null;
  phone: string;
  email: string;
  address: string;
  heroImage: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  workshopImage: string;
  craftImage: string;
  promoMesaImage: string;
  promoTvImage: string;
  galleryImages: string | null;
  beforeAfterJson: string | null;
};

let cachedCompany: { data: StoreCompany; expiresAt: number } | null = null;
let cachedCategories: { data: string[]; expiresAt: number } | null = null;

export function invalidateStoreCompanyCache() {
  cachedCompany = null;
  cachedCategories = null;
}

export async function getStoreCategories(): Promise<string[]> {
  const now = Date.now();
  if (cachedCategories && cachedCategories.expiresAt > now) {
    return cachedCategories.data;
  }
  try {
    const dbCats = await withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          select: { category: true },
          distinct: ["category"],
          orderBy: { category: "asc" },
        }),
      { fallback: [] as { category: string }[] },
    );
    const data = dbCats.map((c) => c.category).filter(Boolean);
    const ttl = process.env.NODE_ENV === "production" ? 60_000 : 30_000;
    cachedCategories = { data, expiresAt: now + ttl };
    return data;
  } catch {
    return [];
  }
}

export async function getStoreCompany(): Promise<StoreCompany> {
  const now = Date.now();
  if (cachedCompany && cachedCompany.expiresAt > now) {
    return cachedCompany.data;
  }

  try {
    const company = await withDbRetry(
      () =>
        prisma.companySettings.findUnique({
          where: { id: "default" },
        }),
      { fallback: null },
    );
    const result = {
      name: company?.name || "Mudeco Palets",
      slogan: company?.slogan || "Muebles a la medida",
      taxId: company?.taxId || process.env.COMPANY_TAX_ID || null,
      phone: company?.phone || "+1 (809) 704-7519",
      email: company?.email || "mudecopalets@gmail.com",
      address:
        company?.address ||
        "Prolongación Avenida 27 de Febrero, Región Ozama, Santo Domingo Oeste, República Dominicana",
      heroImage: company?.heroImage || "/brand/store-hero.jpg",
      heroBadge: company?.heroBadge || "Taller artesanal · República Dominicana",
      heroTitle: company?.heroTitle || "Muebles de madera recuperada con alma de taller",
      heroSubtitle:
        company?.heroSubtitle ||
        "Cada pieza nace de materiales nobles reciclados, transformados con pasión artesanal. Diseños únicos para tu hogar o proyectos comerciales a la medida.",
      workshopImage: company?.workshopImage || "/brand/store-workshop.jpg",
      craftImage: company?.craftImage || "/brand/store-craft.jpg",
      promoMesaImage: company?.promoMesaImage || "/brand/cat-mesa.jpg",
      promoTvImage: company?.promoTvImage || "/brand/cat-tv.jpg",
      galleryImages: company?.galleryImages || null,
      beforeAfterJson: company?.beforeAfterJson || null,
    };
    const ttl = process.env.NODE_ENV === "production" ? 60_000 : 30_000;
    cachedCompany = { data: result, expiresAt: now + ttl };
    return result;
  } catch {
    return {
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      taxId: process.env.COMPANY_TAX_ID || null,
      phone: "+1 (809) 704-7519",
      email: "mudecopalets@gmail.com",
      address:
        "Prolongación Avenida 27 de Febrero, Región Ozama, Santo Domingo Oeste, República Dominicana",
      heroImage: "/brand/store-hero.jpg",
      heroBadge: "Taller artesanal · República Dominicana",
      heroTitle: "Muebles de madera recuperada con alma de taller",
      heroSubtitle:
        "Cada pieza nace de materiales nobles reciclados, transformados con pasión artesanal. Diseños únicos para tu hogar o proyectos comerciales a la medida.",
      workshopImage: "/brand/store-workshop.jpg",
      craftImage: "/brand/store-craft.jpg",
      promoMesaImage: "/brand/cat-mesa.jpg",
      promoTvImage: "/brand/cat-tv.jpg",
      galleryImages: null,
      beforeAfterJson: null,
    };
  }
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
  createdAt?: Date | string;
};

