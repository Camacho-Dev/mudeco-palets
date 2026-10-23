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
  "/reparaciones",
  "/carrito",
  "/checkout",
  "/pedido",
  "/privacidad",
  "/terminos",
] as const;

export function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

/** @deprecated usar isAdminPath */
export const isSensitivePath = isAdminPath;
