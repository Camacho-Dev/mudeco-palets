import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreHeaderClient } from "@/components/store/store-header-client";
import { STORE_CATEGORIES } from "@/lib/store-brand";
import { getStoreCategories } from "@/lib/store";
import type { CustomerProfileSummary } from "@/components/store/header-auth";

export async function StoreHeader() {
  const [session, fromDb] = await Promise.all([
    auth().catch(() => null),
    getStoreCategories(),
  ]);

  let user: CustomerProfileSummary | null = null;

  if (session?.user?.email) {
    const email = session.user.email.toLowerCase().trim();
    const [dbUser, ordersCount] = await Promise.all([
      prisma.user
        .findUnique({
          where: { email },
          select: { name: true, email: true, role: true, phone: true, address: true, active: true },
        })
        .catch(() => null),
      prisma.webOrder
        .count({
          where: { customerEmail: { equals: email, mode: "insensitive" } },
        })
        .catch(() => 0),
    ]);

    if (dbUser && dbUser.active) {
      user = {
        name: dbUser.name || session.user.name || null,
        email: session.user.email,
        role: dbUser.role || session.user.role || null,
        phone: dbUser.phone || null,
        address: dbUser.address || null,
        ordersCount,
      };
    } else {
      user = null;
    }
  }

  // Mostrar solo las categorías reales que tienen productos activos en el inventario
  const sourceCategories = fromDb.length > 0 ? fromDb : [...STORE_CATEGORIES];
  const categories = Array.from(new Set(sourceCategories)).sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  return <StoreHeaderClient user={user} categories={categories} />;
}
