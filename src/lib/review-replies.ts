// Utilidades puras (sin Prisma) para el hilo de respuestas de los comentarios.
// Se almacenan en `CustomerReview.officialReply` como JSON, manteniendo
// compatibilidad total con los valores antiguos en texto plano.

export type ReviewReplyItem = {
  id: string;
  authorName: string;
  isOfficial: boolean;
  text: string;
  replyToHandle?: string | null;
  createdAt: string;
};

export const MAX_REPLIES_PER_REVIEW = 60;

// Convierte un nombre a un handle estilo YouTube (@usuario)
export function toHandle(name: string) {
  return "@" + name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 18);
}

export function sanitizeHandle(handle?: string | null): string | null {
  if (!handle) return null;
  const h = handle.trim();
  return /^@[a-z0-9_]{1,24}$/.test(h) ? h : null;
}

export function parseReviewReplies(
  raw: string | null | undefined,
  fallbackDate?: Date | string | null,
): ReviewReplyItem[] {
  if (!raw || !raw.trim()) return [];
  const value = raw.trim();
  const fallback = fallbackDate ? new Date(fallbackDate).toISOString() : new Date(0).toISOString();

  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (r): r is ReviewReplyItem =>
              !!r &&
              typeof r === "object" &&
              typeof (r as ReviewReplyItem).id === "string" &&
              typeof (r as ReviewReplyItem).text === "string" &&
              typeof (r as ReviewReplyItem).authorName === "string",
          )
          .map((r) => ({
            id: r.id,
            authorName: r.authorName,
            isOfficial: Boolean(r.isOfficial),
            text: r.text,
            replyToHandle: sanitizeHandle(r.replyToHandle),
            createdAt: typeof r.createdAt === "string" ? r.createdAt : fallback,
          }));
      }
    } catch {
      // Si no es JSON válido se trata como texto plano (respuesta oficial antigua)
    }
  }

  return [
    {
      id: "official-legacy",
      authorName: "Mudeco Palets",
      isOfficial: true,
      text: value,
      replyToHandle: null,
      createdAt: fallback,
    },
  ];
}

export function serializeReviewReplies(list: ReviewReplyItem[]): string | null {
  if (list.length === 0) return null;
  return JSON.stringify(list.slice(-MAX_REPLIES_PER_REVIEW));
}

