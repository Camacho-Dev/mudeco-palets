export interface OrderReceipt {
  url: string;
  name: string;
  uploadedAt: string;
  sizeBytes?: number;
  mimeType?: string;
}

function isSafeReceiptUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/comprobantes/") && !trimmed.includes("..")) {
    return true;
  }
  if (
    /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,[A-Za-z0-9+/=]+$/.test(
      trimmed,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Extrae la información del comprobante adjunto desde el campo notes de WebOrder,
 * validando estrictamente que la URL provenga de una ruta o Data URI segura.
 */
export function extractReceiptFromNotes(notes: string | null | undefined): OrderReceipt | null {
  if (!notes) return null;

  // Formato JSON estructurado: [COMPROBANTE_PAGO: {...}]
  const jsonMatch = notes.match(/\[COMPROBANTE_PAGO:\s*(\{[\s\S]*?\})\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (
        parsed &&
        typeof parsed.url === "string" &&
        isSafeReceiptUrl(parsed.url)
      ) {
        return {
          url: parsed.url.trim(),
          name: String(parsed.name || "comprobante").slice(0, 120),
          uploadedAt: String(parsed.uploadedAt || new Date().toISOString()),
          sizeBytes: typeof parsed.sizeBytes === "number" ? parsed.sizeBytes : undefined,
          mimeType: typeof parsed.mimeType === "string" ? parsed.mimeType : undefined,
        };
      }
    } catch {
      // Intentar fallback si falla JSON
    }
  }

  // Formato simple alternativo: [COMPROBANTE: url | name | timestamp]
  const textMatch = notes.match(/\[COMPROBANTE:\s*([^\|]+)\|([^\|]+)\|([^\]]+)\]/);
  if (textMatch) {
    const candidateUrl = textMatch[1].trim();
    if (isSafeReceiptUrl(candidateUrl)) {
      return {
        url: candidateUrl,
        name: textMatch[2].trim().slice(0, 120),
        uploadedAt: textMatch[3].trim(),
      };
    }
  }

  return null;
}

/**
 * Añade o reemplaza la etiqueta de comprobante en el campo notes.
 */
export function attachReceiptToNotes(
  existingNotes: string | null | undefined,
  receipt: OrderReceipt,
): string {
  const clean = (existingNotes || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
    .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
    .trim();

  const tag = `[COMPROBANTE_PAGO: ${JSON.stringify(receipt)}]`;
  return clean ? `${clean}\n\n${tag}` : tag;
}
