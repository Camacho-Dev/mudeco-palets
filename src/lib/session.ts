import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdmin, isStaff } from "@/lib/rbac";

const getVerifiedUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });
});

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await getVerifiedUser(session.user.id);
  if (!dbUser || !dbUser.active) redirect("/login");

  session.user.role = dbUser.role;
  session.user.name = dbUser.name;
  session.user.email = dbUser.email;

  if (!isStaff(dbUser.role)) redirect("/");
  return session;
}

export async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await getVerifiedUser(session.user.id);
  if (!dbUser || !dbUser.active) redirect("/login");

  session.user.role = dbUser.role;
  session.user.name = dbUser.name;
  session.user.email = dbUser.email;
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
