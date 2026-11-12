import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Toma el siguiente NCF de la serie activa del tipo indicado (ej. B01, B02) */
export async function allocateNcf(
  type: string,
  tx?: Prisma.TransactionClient,
): Promise<string | null> {
  const db = tx ?? prisma;
  const series = await db.ncfSeries.findFirst({
    where: { type, active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!series) return null;
  if (series.expiresAt && series.expiresAt < new Date()) {
    throw new Error(`Serie NCF ${type} vencida`);
  }
  if (series.nextSeq > series.maxSeq) {
    throw new Error(`Serie NCF ${type} agotada`);
  }

  const updated = await db.ncfSeries.update({
    where: { id: series.id },
    data: { nextSeq: { increment: 1 } },
  });
  const seq = updated.nextSeq - 1;

  return `${series.prefix}${String(seq).padStart(8, "0")}`;
}
