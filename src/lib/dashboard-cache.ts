import { cache } from "react";
import { prisma, withDbRetry } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Cache a nivel de petición (React Server Components).
 * Si múltiples componentes en el árbol de layout o página solicitan la sesión
 * o los pedidos web pendientes en la misma navegación, se ejecuta exactamente UNA vez.
 */

export const getCachedAuthSession = cache(async () => {
  return await auth();
});

export type PendingWebOrderSummary = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  type: string;
  serviceKind: string | null;
  status: string;
  createdAt: Date;
};

export const getCachedPendingWebOrders = cache(async () => {
  try {
    const [count, recent] = await withDbRetry(
      () =>
        Promise.all([
          prisma.webOrder.count({
            where: {
              status: {
                in: ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"],
              },
            },
          }),
          prisma.webOrder.findMany({
            where: {
              status: {
                in: ["PENDING", "AWAITING_PAYMENT", "QUOTED", "IN_PROGRESS"],
              },
            },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
              id: true,
              number: true,
              customerName: true,
              total: true,
              type: true,
              serviceKind: true,
              status: true,
              createdAt: true,
            },
          }),
        ]),
      { fallback: [0, []] as [number, PendingWebOrderSummary[]] },
    );
    return { count, recent };
  } catch {
    return { count: 0, recent: [] };
  }
});
