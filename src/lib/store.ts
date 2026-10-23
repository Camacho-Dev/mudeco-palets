import { prisma, withDbRetry } from "@/lib/prisma";
import { productImage } from "@/lib/product-image";

export { productImage };

export async function getStoreCompany() {
  try {
    const company = await withDbRetry(
      () =>
        prisma.companySettings.findUnique({
          where: { id: "default" },
        }),
      { fallback: null },
    );
    return {
      name: company?.name || "Mudeco Palets",
      slogan: company?.slogan || "Muebles a la medida",
      phone: company?.phone || "+1 (809) 704-7519",
      email: company?.email || "Mudecopalets@gmail.com",
      address:
        company?.address ||
        "Santo Domingo Oeste, Santo Domingo, República Dominicana",
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
  } catch {
    return {
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      phone: "+1 (809) 704-7519",
      email: "Mudecopalets@gmail.com",
      address: "Santo Domingo Oeste, Santo Domingo, República Dominicana",
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
};
