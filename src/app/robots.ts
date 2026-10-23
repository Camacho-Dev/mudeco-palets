import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/store-info";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalogo",
          "/producto/",
          "/reparaciones",
          "/nosotros",
          "/contacto",
          "/terminos",
          "/privacidad",
          "/brand/",
        ],
        disallow: [
          "/api/",
          "/panel/",
          "/vender/",
          "/facturas/",
          "/cotizaciones/",
          "/pedidos-web/",
          "/clientes/",
          "/productos/",
          "/inventario/",
          "/materiales/",
          "/pagos/",
          "/proveedores/",
          "/compras/",
          "/notas-credito/",
          "/fabricacion/",
          "/empleados/",
          "/usuarios/",
          "/exportar/",
          "/backup/",
          "/contenido-web/",
          "/configuracion/",
          "/auditoria/",
          "/login",
          "/checkout/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
