"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

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

  const dataToUpdate: Record<string, any> = {};

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

  revalidatePath("/");
  revalidatePath("/contenido-web");
  revalidatePath("/catalogo");
  revalidatePath("/reparaciones");

  return { success: true };
}
