import { prisma } from "@/lib/prisma";

async function nextNumber(
  prefix: string,
  kind: "invoice" | "quote" | "creditNote" | "purchase" | "workOrder" | "webOrder",
) {
  const id = prefix;

  const row = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceCounter.findUnique({ where: { id } });
    if (existing) {
      return tx.invoiceCounter.update({
        where: { id },
        data: { last: { increment: 1 } },
      });
    }

    // Inicialización la primera vez en el año determinando el valor máximo previo
    const rows =
      kind === "invoice"
        ? await tx.invoice.findMany({
            where: { number: { startsWith: `${prefix}-` } },
            select: { number: true },
          })
        : kind === "quote"
          ? await tx.quote.findMany({
              where: { number: { startsWith: `${prefix}-` } },
              select: { number: true },
            })
          : kind === "creditNote"
            ? await tx.creditNote.findMany({
                where: { number: { startsWith: `${prefix}-` } },
                select: { number: true },
              })
            : kind === "purchase"
              ? await tx.purchase.findMany({
                  where: { number: { startsWith: `${prefix}-` } },
                  select: { number: true },
                })
              : kind === "workOrder"
                ? await tx.workOrder.findMany({
                    where: { number: { startsWith: `${prefix}-` } },
                    select: { number: true },
                  })
                : await tx.webOrder.findMany({
                    where: { number: { startsWith: `${prefix}-` } },
                    select: { number: true },
                  });

    let dbMax = 0;
    for (const r of rows) {
      const part = r.number.split("-").pop();
      const n = Number(part);
      if (!Number.isNaN(n) && n > dbMax) dbMax = n;
    }

    return tx.invoiceCounter.create({
      data: { id, last: dbMax + 1 },
    });
  });

  return `${id}-${String(row.last).padStart(5, "0")}`;
}

export async function nextInvoiceNumber() {
  return nextNumber(`FAC-${new Date().getFullYear()}`, "invoice");
}

export async function nextQuoteNumber() {
  return nextNumber(`COT-${new Date().getFullYear()}`, "quote");
}

export async function nextCreditNoteNumber() {
  return nextNumber(`NC-${new Date().getFullYear()}`, "creditNote");
}

export async function nextPurchaseNumber() {
  return nextNumber(`OC-${new Date().getFullYear()}`, "purchase");
}

export async function nextWorkOrderNumber() {
  return nextNumber(`OF-${new Date().getFullYear()}`, "workOrder");
}

export async function nextWebOrderNumber() {
  return nextNumber(`WEB-${new Date().getFullYear()}`, "webOrder");
}
