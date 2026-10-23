import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { WebMediaManager } from "./web-media-manager";
import { Activity, Globe, ExternalLink, ShoppingBag } from "lucide-react";

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

  let beforeAfterItems = [
    {
      id: "mesa",
      title: "Mesa de centro rústica",
      category: "Restauración artesanal",
      description: "Madera de palets de pino seleccionados, cepillada, curada contra plagas y sellada con aceite natural mate.",
      beforeImg: "/brand/store-workshop.jpg",
      afterImg: "/brand/cat-mesa.jpg",
      beforeLabel: "Antes · Madera en bruto",
      afterLabel: "Después · Ebanistería fina",
    },
    {
      id: "tv",
      title: "Consola de TV moderna",
      category: "Fabricación a medida",
      description: "Diseño minimalista con compartimentos ocultos y ensamble de caja y espiga para máxima rigidez.",
      beforeImg: "/brand/store-craft.jpg",
      afterImg: "/brand/cat-tv.jpg",
      beforeLabel: "Antes · Vetas sin curar",
      afterLabel: "Después · Acabado satinado",
    },
    {
      id: "banco",
      title: "Banco industrial reforzado",
      category: "Mueble de uso intensivo",
      description: "Estructura robusta de doble capa con acabado resistente a la intemperie y tono roble envejecido.",
      beforeImg: "/brand/store-workshop.jpg",
      afterImg: "/brand/cat-banco.jpg",
      beforeLabel: "Antes · Palet desarmado",
      afterLabel: "Después · Barniz protector",
    },
  ];

  if (company?.beforeAfterJson) {
    try {
      const parsed = JSON.parse(company.beforeAfterJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        beforeAfterItems = parsed;
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
    beforeAfterItems,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fotos y Contenido de la Web"
        description="Administra y sube las imágenes, portadas y fotografías que se muestran en la tienda pública"
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

      <WebMediaManager initialData={initialData} />
    </div>
  );
}
