/** Parsea fecha de input type="date" (YYYY-MM-DD). Devuelve null si vacía o inválida. */
export function parseOptionalDate(raw: string | null | undefined): Date | null {
  const s = String(raw || "").trim();
  if (!s) return null;

  // Solo formato de <input type="date">
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    throw new Error("Fecha inválida. Usa el selector de fecha.");
  }

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (year < 2000 || year > 2100) {
    throw new Error("La fecha debe estar entre 2000 y 2100");
  }

  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    throw new Error("Fecha inválida");
  }

  return d;
}
