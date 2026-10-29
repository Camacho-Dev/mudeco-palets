import { auth } from "@/lib/auth";
import { StoreHeaderClient } from "@/components/store/store-header-client";
import { STORE_CATEGORIES } from "@/lib/store-brand";
import { getStoreCategories } from "@/lib/store";

export async function StoreHeader() {
  const [session, fromDb] = await Promise.all([
    auth().catch(() => null),
    getStoreCategories(),
  ]);

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  // Mostrar solo las categorías reales que tienen productos activos en el inventario
  const sourceCategories = fromDb.length > 0 ? fromDb : [...STORE_CATEGORIES];
  const categories = Array.from(new Set(sourceCategories)).sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  return <StoreHeaderClient user={user} categories={categories} />;
}
