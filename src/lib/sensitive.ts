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
  "/privacidad",
  "/terminos",
] as const;

/**
 * Rutas de la cuenta del cliente: requieren sesión, pero cualquier rol
 * (también CLIENTE) puede entrar. El proxy redirige al login sin sesión,
 * antes de renderizar nada.
 */
export const CUSTOMER_PREFIXES = ["/mis-pedidos"] as const;

export function isCustomerPath(pathname: string) {
  return CUSTOMER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Archivos y endpoints que se leen sin sesión: metadatos (SEO / PWA) y el
 * chequeo de salud que usan los monitores externos (no expone datos).
 */
const PUBLIC_FILES = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/api/health",
]);

export function isPublicPath(pathname: string) {
  if (pathname === "/" || PUBLIC_FILES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

/** @deprecated usar isAdminPath */
export const isSensitivePath = isAdminPath;
