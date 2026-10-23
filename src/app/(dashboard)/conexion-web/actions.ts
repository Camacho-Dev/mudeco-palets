"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { isStripeConfigured } from "@/lib/stripe";

/** Forzar revalidación de todas las rutas de la tienda pública y del panel */
export async function revalidateWebStoreCache() {
  const session = await requireAdmin();

  // Revalidar todas las páginas públicas de la tienda
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/reparaciones");
  revalidatePath("/contacto");
  revalidatePath("/nosotros");
  revalidatePath("/carrito");
  revalidatePath("/checkout");
  revalidatePath("/panel");
  revalidatePath("/contenido-web");
  revalidatePath("/pedidos-web");
  revalidatePath("/productos");

  const timestamp = new Date().toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  await writeAudit({
    action: "CACHE_PURGE",
    entity: "WebStore",
    entityId: "storefront",
    summary: `Revalidación forzada de caché web ejecutada (${timestamp})`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  return {
    success: true,
    message: "Caché de la tienda web revalidada con éxito en todas las rutas públicas.",
    timestamp,
  };
}

/** Ejecuta un diagnóstico integral de la salud del catálogo web */
export async function runCatalogDiagnostics() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const total = products.length;
  const active = products.filter((p) => p.active);
  const inactive = products.filter((p) => !p.active);
  const withoutImage = products.filter((p) => !p.imageUrl || p.imageUrl.trim() === "");
  const outOfStockActive = products.filter((p) => p.active && p.stock <= 0);
  const lowStockActive = products.filter((p) => p.active && p.stock > 0 && p.stock <= (p.minStock ?? 2));
  const zeroPrice = products.filter((p) => p.active && p.price <= 0);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const issues: {
    level: "warn" | "error" | "info";
    title: string;
    description: string;
    count: number;
    items: { id: string; name: string }[];
  }[] = [];

  if (outOfStockActive.length > 0) {
    issues.push({
      level: "warn",
      title: "Muebles activos con stock agotado (0)",
      description: "Aparecen en la tienda web pero tienen stock 0. Si un cliente intenta comprar online, el sistema verificará existencias.",
      count: outOfStockActive.length,
      items: outOfStockActive.slice(0, 10).map((p) => ({ id: p.id, name: p.name })),
    });
  }

  if (withoutImage.length > 0) {
    issues.push({
      level: "warn",
      title: "Muebles sin fotografía asignada",
      description: "Están utilizando la imagen de marcador de posición por defecto de su categoría.",
      count: withoutImage.length,
      items: withoutImage.slice(0, 10).map((p) => ({ id: p.id, name: p.name })),
    });
  }

  if (zeroPrice.length > 0) {
    issues.push({
      level: "error",
      title: "Muebles con precio en RD$ 0",
      description: "Tienen precio asignado de cero. Se recomienda corregir el precio de venta antes de que se agreguen al carrito.",
      count: zeroPrice.length,
      items: zeroPrice.slice(0, 10).map((p) => ({ id: p.id, name: p.name })),
    });
  }

  if (lowStockActive.length > 0) {
    issues.push({
      level: "info",
      title: "Muebles con stock bajo",
      description: "Tienen existencia igual o menor a su stock mínimo de seguridad.",
      count: lowStockActive.length,
      items: lowStockActive.slice(0, 10).map((p) => ({ id: p.id, name: p.name })),
    });
  }

  return {
    success: true,
    stats: {
      total,
      activeCount: active.length,
      inactiveCount: inactive.length,
      withoutImageCount: withoutImage.length,
      outOfStockCount: outOfStockActive.length,
      lowStockCount: lowStockActive.length,
      zeroPriceCount: zeroPrice.length,
      categoriesCount: categories.length,
    },
    issues,
    timestamp: new Date().toLocaleString("es-DO", {
      dateStyle: "short",
      timeStyle: "medium",
    }),
  };
}

/** Verifica el estado de conectividad de Stripe */
export async function checkStripeStatus() {
  await requireAdmin();
  const configured = isStripeConfigured();
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;

  return {
    success: true,
    configured,
    hasWebhookSecret,
    environment: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
      ? "Producción (Live)"
      : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
        ? "Pruebas (Test / Sandbox)"
        : "No configurado",
    webhookUrl: "/api/stripe/webhook",
  };
}

/** Crea un pedido web de prueba para verificar todo el circuito */
export async function createDiagnosticWebOrder() {
  const session = await requireAdmin();

  // Buscar el primer producto activo con precio
  const sampleProduct = await prisma.product.findFirst({
    where: { active: true, price: { gt: 0 } },
  });

  const now = new Date();
  const number = `TEST-WEB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const unitPrice = sampleProduct ? sampleProduct.price : 2500;
  const quantity = 1;
  const total = unitPrice * quantity;
  const subtotal = +(total / 1.18).toFixed(2);
  const tax = +(total - subtotal).toFixed(2);

  const testOrder = await prisma.webOrder.create({
    data: {
      number,
      type: "SALE",
      paymentMode: "LOCAL",
      status: "PENDING",
      customerName: "Cliente de Prueba (Diagnóstico Web)",
      customerEmail: "soporte-web@mudecopalets.com",
      customerPhone: "(809) 555-0199",
      customerAddress: "Calle Principal #10, Santo Domingo, R.D.",
      subtotal,
      tax,
      total,
      notes: "Pedido de prueba generado desde el Centro de Conexión Web para validar sincronización y conversión.",
      items: {
        create: [
          {
            productId: sampleProduct?.id || null,
            description: sampleProduct?.name || "Mueble de Madera de Palet de Prueba",
            quantity,
            unitPrice,
            taxRate: 0.18,
            lineTotal: total,
          },
        ],
      },
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "WebOrder",
    entityId: testOrder.id,
    summary: `Pedido web de prueba ${number} creado con éxito`,
    userId: session.user?.id,
    userEmail: session.user?.email,
    userName: session.user?.name,
  });

  revalidatePath("/pedidos-web");
  revalidatePath("/conexion-web");
  revalidatePath("/panel");

  return {
    success: true,
    orderId: testOrder.id,
    orderNumber: testOrder.number,
    message: `Pedido de prueba ${number} creado satisfactoriamente.`,
  };
}
