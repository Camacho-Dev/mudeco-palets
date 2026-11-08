import { cache } from "react";
import { prisma, withDbRetry } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdmin, isStaff } from "@/lib/rbac";
import { getCachedAuthSession } from "@/lib/dashboard-cache";

const getVerifiedUser = cache(async (userId: string) => {
  return withDbRetry(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
        },
      }),
    { retries: 3 },
  );
});

export async function requireSession() {
  const session = await getCachedAuthSession();
  if (!session?.user?.id) redirect("/login");

  try {
    const dbUser = await getVerifiedUser(session.user.id);
    if (!dbUser || !dbUser.active) redirect("/login");

    session.user.role = dbUser.role;
    session.user.name = dbUser.name;
    session.user.email = dbUser.email;
  } catch (err) {
    // Si es un redirect de Next.js, propagarlo siempre
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    // Si la BD está despertando en un cold-start tras un deploy pero el token JWT firmado es válido,
    // conservar los datos del token para no tumbar el panel administrativo.
    if (!session.user.role) redirect("/login");
  }

  if (!isStaff(session.user.role)) redirect("/");
  return session;
}

export async function requireAuthenticatedUser() {
  const session = await getCachedAuthSession();
  if (!session?.user?.id) redirect("/login");

  try {
    const dbUser = await getVerifiedUser(session.user.id);
    if (!dbUser || !dbUser.active) redirect("/login");

    session.user.role = dbUser.role;
    session.user.name = dbUser.name;
    session.user.email = dbUser.email;
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
  }
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
