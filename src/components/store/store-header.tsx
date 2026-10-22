import { auth } from "@/lib/auth";
import { prisma, withDbRetry } from "@/lib/prisma";
import { StoreHeaderClient } from "@/components/store/store-header-client";
import { STORE_CATEGORIES } from "@/lib/store-brand";

export async function StoreHeader() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  let fromDb: string[] = [];
  try {
    const dbCats = await withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          select: { category: true },
          distinct: ["category"],
          orderBy: { category: "asc" },
        }),
      { fallback: [] as { category: string }[] },
    );
    fromDb = dbCats.map((c) => c.category).filter(Boolean);
  } catch {
    // Neon suspendido / sin red: usamos categorías estáticas
  }

  // Menú de categorías: las del sitio real + las que existan en el ERP
  const categories = Array.from(
    new Set([...STORE_CATEGORIES, ...fromDb]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return <StoreHeaderClient user={user} categories={categories} />;
}
