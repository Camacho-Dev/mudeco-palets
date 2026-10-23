import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { WebMediaManager } from "./web-media-manager";

export const metadata = {
  title: "Fotos de la Web",
};

const DEFAULT_GALLERY = [
  "/brand/store-hero.jpg",
  "/brand/cat-mesa.jpg",
  "/brand/cat-tv.jpg",
  "/brand/cat-noche.jpg",
  "/brand/cat-banco.jpg",
  "/brand/cat-vinera.jpg",
  "/brand/store-craft.jpg",
  "/brand/store-workshop.jpg",
];

export default async function ContenidoWebPage() {
  await requireAdmin();

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  let gallery = DEFAULT_GALLERY;
  if (company?.galleryImages) {
    try {
      const parsed = JSON.parse(company.galleryImages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        gallery = parsed;
      }
    } catch {
      // fallback
    }
  }

  const initialData = {
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
    galleryImages: gallery.slice(0, 8),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fotos y Contenido de la Web"
        description="Administra y sube las imágenes, portadas y fotografías que se muestran en la tienda pública"
      />

      <WebMediaManager initialData={initialData} />
    </div>
  );
}
