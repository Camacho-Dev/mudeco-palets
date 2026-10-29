export interface OrderReceipt {
  url: string;
  name: string;
  uploadedAt: string;
  sizeBytes?: number;
  mimeType?: string;
}

/**
 * Extrae la información del comprobante adjunto desde el campo notes de WebOrder.
 */
export function extractReceiptFromNotes(notes: string | null | undefined): OrderReceipt | null {
  if (!notes) return null;

  // Formato JSON estructurado: [COMPROBANTE_PAGO: {...}] usando [\s\S]*? compatible con todas las versiones de ES
  const jsonMatch = notes.match(/\[COMPROBANTE_PAGO:\s*(\{[\s\S]*?\})\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed && typeof parsed.url === "string") {
        return parsed as OrderReceipt;
      }
    } catch {
      // Intentar fallback si falla JSON
    }
  }

  // Formato simple alternativo: [COMPROBANTE: url | name | timestamp]
  const textMatch = notes.match(/\[COMPROBANTE:\s*([^\|]+)\|([^\|]+)\|([^\]]+)\]/);
  if (textMatch) {
    return {
      url: textMatch[1].trim(),
      name: textMatch[2].trim(),
      uploadedAt: textMatch[3].trim(),
    };
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
  // Limpiar cualquier etiqueta previa de comprobante sin flag s
  const clean = (existingNotes || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
    .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
    .trim();

  const tag = `[COMPROBANTE_PAGO: ${JSON.stringify(receipt)}]`;
  return clean ? `${clean}\n\n${tag}` : tag;
}
