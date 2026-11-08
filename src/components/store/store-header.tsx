import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreHeaderClient } from "@/components/store/store-header-client";
import { STORE_CATEGORIES } from "@/lib/store-brand";
import { getStoreCategories } from "@/lib/store";
import { WEB_STATUS_LABEL } from "@/lib/web-order-labels";
import type { CustomerProfileSummary } from "@/components/store/header-auth";

export async function StoreHeader() {
  const [session, fromDb] = await Promise.all([
    auth().catch(() => null),
    getStoreCategories(),
  ]);

  let user: CustomerProfileSummary | null = null;

  if (session?.user?.email) {
    const email = session.user.email.toLowerCase().trim();
    const [dbUser, orders] = await Promise.all([
      prisma.user
        .findUnique({
          where: { email },
          select: { name: true, email: true, role: true, phone: true, address: true },
        })
        .catch(() => null),
      prisma.webOrder
        .findMany({
          where: { customerEmail: { equals: email, mode: "insensitive" } },
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            createdAt: true,
            customerPhone: true,
            customerAddress: true,
            customerName: true,
            items: {
              select: {
                description: true,
                quantity: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 25,
        })
        .catch(() => []),
    ]);

    const rawName = dbUser?.name || session.user.name || "";
    const latestOrderWithName = orders.find(
      (o) =>
        o.customerName &&
        o.customerName.trim().toLowerCase() !== "administrador" &&
        o.customerName.trim().length > 1,
    );
    const cleanName =
      rawName.trim().toLowerCase() === "administrador"
        ? latestOrderWithName?.customerName || ""
        : rawName;

    const phone =
      dbUser?.phone ||
      orders.find((o) => o.customerPhone && o.customerPhone.trim().length > 0)
        ?.customerPhone ||
      null;
    const address =
      dbUser?.address ||
      orders.find(
        (o) => o.customerAddress && o.customerAddress.trim().length > 0,
      )?.customerAddress ||
      null;

    const validOrders = orders.filter((o) => o.status !== "CANCELLED");
    const totalSpent = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    user = {
      name: cleanName || null,
      email: session.user.email,
      role: dbUser?.role || session.user.role || null,
      phone,
      address,
      ordersCount: orders.length,
      totalSpent,
      recentOrders: orders.slice(0, 4).map((o) => ({
        id: o.id,
        number: o.number,
        total: o.total,
        status: o.status,
        statusLabel: WEB_STATUS_LABEL[o.status] || o.status,
        createdAt: o.createdAt.toISOString(),
        itemsSummary:
          o.items.length > 0
            ? o.items
                .map((i) => `${i.quantity}x ${i.description}`)
                .join(", ")
            : "Cotización personalizada",
      })),
    };
  }

  // Mostrar solo las categorías reales que tienen productos activos en el inventario
  const sourceCategories = fromDb.length > 0 ? fromDb : [...STORE_CATEGORIES];
  const categories = Array.from(new Set(sourceCategories)).sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  return <StoreHeaderClient user={user} categories={categories} />;
}
