"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { invalidateScoredProductsCache } from "@/lib/recommendations";
import { invalidateStoreCompanyCache } from "@/lib/store";

function triggerStoreRevalidation(productId?: string) {
  invalidateScoredProductsCache();
  invalidateStoreCompanyCache();
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath("/contenido-web");
    revalidatePath("/productos");
    if (productId) {
      revalidatePath(`/producto/${productId}`);
    }
  } catch (err) {
    console.error("Error al revalidar rutas:", err);
  }
}

export async function updateWebMedia(payload: {
  heroImage?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  workshopImage?: string;
  craftImage?: string;
  promoMesaImage?: string;
  promoTvImage?: string;
  galleryImages?: string[];
  beforeAfterJson?: string;
}) {
  await requireAdmin();

  const dataToUpdate: Record<string, string> = {};

  if (payload.heroImage !== undefined) dataToUpdate.heroImage = payload.heroImage;
  if (payload.heroBadge !== undefined) dataToUpdate.heroBadge = payload.heroBadge;
  if (payload.heroTitle !== undefined) dataToUpdate.heroTitle = payload.heroTitle;
  if (payload.heroSubtitle !== undefined) dataToUpdate.heroSubtitle = payload.heroSubtitle;
  if (payload.workshopImage !== undefined) dataToUpdate.workshopImage = payload.workshopImage;
  if (payload.craftImage !== undefined) dataToUpdate.craftImage = payload.craftImage;
  if (payload.promoMesaImage !== undefined) dataToUpdate.promoMesaImage = payload.promoMesaImage;
  if (payload.promoTvImage !== undefined) dataToUpdate.promoTvImage = payload.promoTvImage;
  if (payload.galleryImages !== undefined) {
    dataToUpdate.galleryImages = JSON.stringify(payload.galleryImages);
  }
  if (payload.beforeAfterJson !== undefined) {
    dataToUpdate.beforeAfterJson = payload.beforeAfterJson;
  }

  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: dataToUpdate,
    create: { id: "default", ...dataToUpdate },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "WebMedia",
    entityId: "default",
    summary: "Fotos y contenidos multimedia de la tienda web actualizados",
  });

  triggerStoreRevalidation();

  return { success: true };
}

export async function updateProductQuick(payload: {
  id: string;
  price?: number;
  imageUrl?: string | null;
  name?: string;
  category?: string;
  active?: boolean;
}) {
  await requireAdmin();

  const dataToUpdate: Record<string, string | number | boolean | null> = {};
  if (payload.price !== undefined) dataToUpdate.price = Math.max(0, Number(payload.price));
  if (payload.imageUrl !== undefined) dataToUpdate.imageUrl = payload.imageUrl ? payload.imageUrl.trim() : null;
  if (payload.name !== undefined) dataToUpdate.name = payload.name.trim();
  if (payload.category !== undefined) dataToUpdate.category = payload.category.trim();
  if (payload.active !== undefined) dataToUpdate.active = Boolean(payload.active);

  const updated = await prisma.product.update({
    where: { id: payload.id },
    data: dataToUpdate,
  });

  await writeAudit({
    action: "UPDATE",
    entity: "Product",
    entityId: payload.id,
    summary: `Mueble editado desde Fotos de la Web: ${updated.name} (RD$ ${updated.price})`,
    details: dataToUpdate,
  });

  triggerStoreRevalidation(payload.id);

  return {
    success: true,
    product: {
      id: updated.id,
      name: updated.name,
      sku: updated.sku,
      category: updated.category,
      price: updated.price,
      stock: updated.stock,
      imageUrl: updated.imageUrl,
      active: updated.active,
      description: updated.description,
    },
  };
}

export async function createProductQuick(payload: {
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
}) {
  await requireAdmin();

  const generatedSku = `MUD-${Date.now().toString().slice(-5)}`;
  const product = await prisma.product.create({
    data: {
      kind: "FINISHED",
      name: payload.name.trim(),
      category: payload.category.trim() || "Muebles",
      price: Math.max(0, Number(payload.price) || 0),
      imageUrl: payload.imageUrl ? payload.imageUrl.trim() : null,
      description: payload.description ? payload.description.trim() : null,
      sku: generatedSku,
      active: true,
      stock: 1,
      taxRate: 0.18,
      cost: 0,
      unit: "UND",
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "Product",
    entityId: product.id,
    summary: `Nuevo mueble agregado desde Fotos de la Web: ${product.name} (RD$ ${product.price})`,
    details: { price: product.price, sku: product.sku },
  });

  triggerStoreRevalidation(product.id);

  return {
    success: true,
    product: {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: product.active,
      description: product.description,
    },
  };
}

export async function deleteProductQuick(id: string) {
  await requireAdmin();

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  await writeAudit({
    action: "DEACTIVATE",
    entity: "Product",
    entityId: id,
    summary: `Mueble ocultado de la web: ${id}`,
  });

  triggerStoreRevalidation(id);

  return { success: true };
}
