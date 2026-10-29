"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { attachReceiptToNotes, type OrderReceipt } from "@/lib/order-receipt";
import { writeAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";

export async function uploadOrderReceiptAction(orderId: string, formData: FormData) {
  try {
    const order = await prisma.webOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Pedido no encontrado en el sistema" };
    }

    const file = formData.get("receipt") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Por favor selecciona un archivo de comprobante" };
    }

    // Límite de 15 MB
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, error: "El archivo no debe exceder los 15 MB" };
    }

    const mime = file.type || "";
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      return {
        success: false,
        error: "Formato no válido. Solo se permiten imágenes (JPG, PNG, WebP) o documentos PDF",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resolvedMime = mime || (isPdf ? "application/pdf" : "image/jpeg");

    let receiptUrl: string;

    if (process.env.VERCEL === "1") {
      receiptUrl = `data:${resolvedMime};base64,${buffer.toString("base64")}`;
    } else {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "comprobantes");
        await mkdir(uploadDir, { recursive: true });

        const originalExt = path.extname(file.name).toLowerCase() || (isPdf ? ".pdf" : ".jpg");
        const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".pdf"].includes(originalExt)
          ? originalExt
          : isPdf
            ? ".pdf"
            : ".jpg";

        const cleanBase = path
          .basename(file.name, originalExt)
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 30);
        const fileName = `recibo_${order.number}_${Date.now()}_${cleanBase}${safeExt}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        receiptUrl = `/uploads/comprobantes/${fileName}`;
      } catch {
        // Respaldo automático en Base de Datos si el disco es de solo lectura
        receiptUrl = `data:${resolvedMime};base64,${buffer.toString("base64")}`;
      }
    }

    const receipt: OrderReceipt = {
      url: receiptUrl,
      name: file.name,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      mimeType: resolvedMime,
    };

    const updatedNotes = attachReceiptToNotes(order.notes, receipt);

    await prisma.webOrder.update({
      where: { id: orderId },
      data: {
        notes: updatedNotes,
      },
    });

    const session = await auth().catch(() => null);

    await writeAudit({
      action: "WEB_ORDER_RECEIPT_UPLOAD",
      entity: "WebOrder",
      entityId: order.id,
      summary: `Cliente subió comprobante para ${order.number} (${file.name})`,
      userId: session?.user?.id,
      userEmail: session?.user?.email || order.customerEmail,
      userName: session?.user?.name || order.customerName,
    }).catch(() => undefined);

    revalidatePath(`/pedido/${orderId}`);
    revalidatePath(`/pedidos-web/${orderId}`);
    revalidatePath("/pedidos-web");

    return { success: true, receipt };
  } catch (error) {
    console.error("Error al subir comprobante de pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al subir comprobante",
    };
  }
}
