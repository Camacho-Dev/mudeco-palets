import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/rbac";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdmin(session.user.role)) {
    redirect("/vender?error=sin-permiso");
  }
  return session;
}

export async function requireRole(...roles: string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role || "")) {
    redirect("/vender?error=sin-permiso");
  }
  return session;
}

export async function assertAdmin() {
  const session = await requireSession();
  if (!isAdmin(session.user.role)) {
    throw new Error("No autorizado: se requiere administrador");
  }
  return session;
}
