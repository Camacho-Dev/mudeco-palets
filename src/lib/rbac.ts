export const ROLES = {
  ADMIN: "ADMIN",
  VENDEDOR: "VENDEDOR",
  CLIENTE: "CLIENTE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isAdmin(role?: string | null) {
  return role === ROLES.ADMIN;
}

export function isStaff(role?: string | null) {
  return role === ROLES.ADMIN || role === ROLES.VENDEDOR;
}

export function canVoidInvoice(role?: string | null) {
  return isAdmin(role);
}

export function canManageUsers(role?: string | null) {
  return isAdmin(role);
}

export function canManagePurchases(role?: string | null) {
  return isAdmin(role);
}

export function canAdjustStock(role?: string | null) {
  return isAdmin(role);
}

export function canManageCompany(role?: string | null) {
  return isAdmin(role);
}

export function canDeleteCustomer(role?: string | null) {
  return isAdmin(role);
}

export function canDeactivateProduct(role?: string | null) {
  return isAdmin(role);
}

export function canDeletePayment(role?: string | null) {
  return isAdmin(role);
}

export function canManageNcf(role?: string | null) {
  return isAdmin(role);
}

export function canIssueCreditNote(role?: string | null) {
  return isAdmin(role);
}

export function canManageFabrication(role?: string | null) {
  return isAdmin(role);
}

export function canExportBackup(role?: string | null) {
  return isAdmin(role);
}

/** Acceso a panel, finanzas, inventario y resto de administración */
export function canAccessAdminArea(role?: string | null) {
  return isAdmin(role);
}

export function homeForRole(role?: string | null) {
  if (role === "ADMIN") return "/panel";
  if (role === "VENDEDOR") return "/vender";
  return "/";
}
