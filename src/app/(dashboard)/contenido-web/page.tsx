import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { WebMediaManager } from "./web-media-manager";
import { Activity, Globe, ExternalLink, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Fotos y Precios de la Web",
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

  const [company, products] = await Promise.all([
    prisma.companySettings.findUnique({
      where: { id: "default" },
    }),
    prisma.product.findMany({
      where: { kind: "FINISHED" },
      orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        price: true,
        stock: true,
        imageUrl: true,
        active: true,
        description: true,
      },
    }),
  ]);

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
        title="Fotos y Precios de la Tienda Web"
        description="Gestiona las fotos y precios de los muebles de la web, portadas principales y galería pública"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/conexion-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Centro de control y diagnóstico de la conexión web"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Conexión Web</span>
            </Link>
            <Link
              href="/pedidos-web"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Pedidos web</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
              title="Abrir tienda en nueva pestaña"
            >
              <Globe className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Tienda pública</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        }
      />

      <WebMediaManager
        initialData={initialData}
        initialProducts={products}
      />
    </div>
  );
}
