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
          "/conexion-web/",
          "/configuracion/",
          "/auditoria/",
          "/login",
          "/checkout/",
          "/pedido/",
          "/mis-pedidos/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
