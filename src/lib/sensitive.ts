/** Rutas solo para rol ADMIN */
export const ADMIN_PREFIXES = [
  "/finanzas",
  "/inventario",
  "/pagos",
  "/configuracion",
  "/auditoria",
  "/usuarios",
  "/proveedores",
  "/compras",
  "/notas-credito",
  "/fabricacion",
  "/materiales",
  "/exportar",
  "/backup",
  "/desbloquear",
] as const;

export function isAdminPath(pathname: string) {
  if (pathname === "/") return true;
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** @deprecated usar isAdminPath */
export const isSensitivePath = isAdminPath;
