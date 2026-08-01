"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calcInvoiceTotals } from "@/lib/invoice-calc";
import { nextQuoteNumber, nextInvoiceNumber } from "@/lib/invoice-number";
import { writeAudit } from "@/lib/audit";
import { parseOptionalDate } from "@/lib/parse-date";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const lineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(1),
});

function parseLines(fd: FormData) {
  const descriptions = fd.getAll("description").map(String);
  const quantities = fd.getAll("quantity");
  const unitPrices = fd.getAll("unitPrice");
  const taxRates = fd.getAll("taxRate");
  const productIds = fd.getAll("productId").map(String);
  const lines = descriptions
    .map((description, i) => {
      const productId = productIds[i] || undefined;
      const desc = description.trim();
      // Si eligió producto sin texto, usa el nombre del option vía description vacía + productId
      if (!desc && !productId) return null;
      if (!desc && productId) {
        // description requerida: el form debe enviar texto; fallback corto
        return lineSchema.parse({
          description: "Ítem",
          quantity: quantities[i] || 1,
          unitPrice: unitPrices[i] || 0,
          taxRate: taxRates[i] ?? 0.18,
          productId,
        });
      }
      return lineSchema.parse({
        description: desc,
        quantity: quantities[i],
        unitPrice: unitPrices[i],
        taxRate: taxRates[i] ?? 0.18,
        productId,
      });
    })
    .filter((l): l is z.infer<typeof lineSchema> => l !== null);
  if (!lines.length) throw new Error("Agrega al menos una línea con descripción o producto");
  return lines;
}

export async function createQuote(fd: FormData) {
  const session = await requireSession();
  const customerId = String(fd.get("customerId") || "");
  if (!customerId) throw new Error("Cliente requerido");
  const notes = String(fd.get("notes") || "") || null;
  const validUntil = parseOptionalDate(String(fd.get("validUntil") || ""));
  const lines = parseLines(fd);

  // Completar descripción desde catálogo si hace falta
  const productIds = lines.map((l) => l.productId).filter(Boolean) as string[];
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({ where: { id: { in: productIds } } })
      : [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const resolved = lines.map((l) => {
    const p = l.productId ? byId.get(l.productId) : null;
    return {
      ...l,
      description:
        l.description && l.description !== "Ítem"
          ? l.description
          : p?.name || l.description,
      unitPrice: l.unitPrice > 0 ? l.unitPrice : (p?.price ?? 0),
      taxRate: l.taxRate || p?.taxRate || 0.18,
    };
  });

  const totals = calcInvoiceTotals(resolved);
  const number = await nextQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      number,
      customerId,
      userId: session.user.id,
      notes,
      validUntil,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: "DRAFT",
      items: {
        create: resolved.map((l) => ({
          productId: l.productId || null,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: Math.round(l.quantity * l.unitPrice * 100) / 100,
        })),
      },
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "Quote",
    entityId: quote.id,
    summary: `Cotización ${quote.number} · total ${quote.total}`,
  });
  revalidatePath("/cotizaciones");
  redirect(`/cotizaciones/${quote.id}`);
}

export async function convertQuoteToInvoice(id: string) {
  const session = await requireSession();
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!quote || quote.status === "CONVERTED") {
    throw new Error("Cotización no convertible");
  }

  const number = await nextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      number,
      status: "DRAFT",
      customerId: quote.customerId,
      userId: session.user.id,
      quoteId: quote.id,
      notes: quote.notes,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      items: {
        create: quote.items.map((l) => ({
          productId: l.productId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        })),
      },
    },
  });

  await prisma.quote.update({
    where: { id },
    data: { status: "CONVERTED" },
  });

  await writeAudit({
    action: "CONVERT",
    entity: "Quote",
    entityId: id,
    summary: `Cotización ${quote.number} → factura ${invoice.number}`,
  });
  revalidatePath("/cotizaciones");
  revalidatePath("/facturas");
  redirect(`/facturas/${invoice.id}/editar`);
}
