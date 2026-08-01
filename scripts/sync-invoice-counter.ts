import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function sync(prefix: string) {
  const invoices = await p.invoice.findMany({
    where: { number: { startsWith: `${prefix}-` } },
    select: { number: true },
  });
  let max = 0;
  for (const r of invoices) {
    const n = Number(r.number.split("-").pop());
    if (!Number.isNaN(n) && n > max) max = n;
  }
  await p.invoiceCounter.upsert({
    where: { id: prefix },
    create: { id: prefix, last: max },
    update: { last: max },
  });
  console.log(prefix, "synced to", max);
}

async function main() {
  const year = new Date().getFullYear();
  await sync(`FAC-${year}`);
  console.log("done");
}

main()
  .finally(() => p.$disconnect());
