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

  // Menú de categorías: las del sitio real + las que existan en el ERP
  const categories = Array.from(
    new Set([...STORE_CATEGORIES, ...fromDb]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return <StoreHeaderClient user={user} categories={categories} />;
}
