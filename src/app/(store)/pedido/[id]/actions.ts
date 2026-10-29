"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { attachReceiptToNotes, type OrderReceipt } from "@/lib/order-receipt";
import { writeAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { checkDualRateLimit } from "@/lib/rate-limit";

function detectReceiptMime(
  buf: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.length >= 5 && buf.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }
  return null;
}

export async function uploadOrderReceiptAction(orderId: string, formData: FormData) {
  try {
    if (!orderId || typeof orderId !== "string") {
      return { success: false, error: "Identificador de pedido inválido" };
    }

    const session = await auth().catch(() => null);

    // Rate limit dual (por IP y por pedido) para evitar flooding o sobreescrituras masivas
    const rl = await checkDualRateLimit({
      scope: "receipt-upload",
      identifier: orderId,
      ipLimit: 8,
      idLimit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.ok) {
      return {
        success: false,
        error: "Demasiados intentos de carga para este pedido. Espera unos minutos.",
      };
    }

    const order = await prisma.webOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Pedido no encontrado en el sistema" };
    }

    // Verificar autorización: Staff o el cliente dueño del pedido
    const staffUser = Boolean(session?.user?.id && isStaff(session.user.role));
    const ownerUser = Boolean(
      session?.user?.email &&
        order.customerEmail &&
        session.user.email.toLowerCase() === order.customerEmail.toLowerCase(),
    );
    if (!staffUser && !ownerUser) {
      return {
        success: false,
        error: "Debes iniciar sesión con la cuenta del pedido para adjuntar el comprobante.",
      };
    }

    // Impedir modificar comprobantes de pedidos ya pagados, finalizados o cancelados (salvo Staff)
    if (!staffUser && ["PAID", "DONE", "CANCELLED"].includes(order.status)) {
      return {
        success: false,
        error: "Este pedido ya fue procesado y no admite nuevos comprobantes.",
      };
    }

    const file = formData.get("receipt") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Por favor selecciona un archivo de comprobante" };
    }

    // Límite estricto de 5 MB para proteger almacenamiento en base de datos
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "El comprobante no debe exceder los 5 MB" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar firma binaria real (magic bytes) — bloquea SVG/HTML malicioso (Stored XSS)
    const resolvedMime = detectReceiptMime(buffer);
    if (!resolvedMime) {
      return {
        success: false,
        error: "Formato no válido. Solo se permiten imágenes reales (JPG, PNG, WebP) o documentos PDF.",
      };
    }

    const isPdf = resolvedMime === "application/pdf";
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
    };
    const safeExt = extMap[resolvedMime] || (isPdf ? ".pdf" : ".jpg");
    const safeDisplayName =
      file.name.replace(/[^\w.\- ()]/g, "_").slice(0, 80) || `comprobante${safeExt}`;

    let receiptUrl: string;

    if (process.env.VERCEL === "1") {
      receiptUrl = `data:${resolvedMime};base64,${buffer.toString("base64")}`;
    } else {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "comprobantes");
        await mkdir(uploadDir, { recursive: true });

        const cleanBase = path
          .basename(file.name, path.extname(file.name))
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 30);
        const fileName = `recibo_${order.number}_${Date.now()}_${cleanBase}${safeExt}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        receiptUrl = `/uploads/comprobantes/${fileName}`;
      } catch {
        receiptUrl = `data:${resolvedMime};base64,${buffer.toString("base64")}`;
      }
    }

    const receipt: OrderReceipt = {
      url: receiptUrl,
      name: safeDisplayName,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      mimeType: resolvedMime,
    };

    const updatedNotes = attachReceiptToNotes(order.notes, receipt);

    await prisma.webOrder.update({
      where: { id: orderId },
      data: {
        notes: updatedNotes,
        ...(order.status === "PENDING" || order.status === "AWAITING_PAYMENT"
          ? { status: "IN_PROGRESS" }
          : {}),
      },
    });

    await writeAudit({
      action: "WEB_ORDER_RECEIPT_UPLOAD",
      entity: "WebOrder",
      entityId: order.id,
      summary: `Cliente subió comprobante para ${order.number} (${safeDisplayName})`,
      userId: session?.user?.id,
      userEmail: session?.user?.email || order.customerEmail,
      userName: session?.user?.name || order.customerName,
    }).catch(() => undefined);

    revalidatePath(`/pedido/${orderId}`);
    revalidatePath(`/pedidos-web/${orderId}`);
    revalidatePath("/pedidos-web");
    revalidatePath("/mis-pedidos");

    return { success: true, receipt };
  } catch (error) {
    console.error("Error al subir comprobante de pedido:", error);
    return {
      success: false,
      error: "Error inesperado al subir el comprobante",
    };
  }
}
