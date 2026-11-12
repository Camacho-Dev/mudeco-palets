/** Rutas solo para rol ADMIN */
export const ADMIN_PREFIXES = [
  "/panel",
  "/finanzas",
  "/inventario",
  "/pagos",
  "/configuracion",
  "/auditoria",
  "/usuarios",
  "/empleados",
  "/proveedores",
  "/compras",
  "/notas-credito",
  "/fabricacion",
  "/materiales",
  "/exportar",
  "/backup",
  "/api/backup",
  "/api/export",
  "/desbloquear",
  "/conexion-web",
  "/contenido-web",
] as const;

/** Rutas de la tienda pública (sin sesión) */
export const PUBLIC_PREFIXES = [
  "/",
  "/catalogo",
  "/producto",
  "/contacto",
  "/nosotros",
  "/carrito",
  "/checkout",
  "/pedido",
  "/mis-pedidos",
  "/privacidad",
  "/terminos",
] as const;

export function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Archivos de metadatos (SEO / PWA) que buscadores y navegadores leen sin sesión */
const PUBLIC_FILES = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

export function isPublicPath(pathname: string) {
  if (pathname === "/" || PUBLIC_FILES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

/** @deprecated usar isAdminPath */
export const isSensitivePath = isAdminPath;
