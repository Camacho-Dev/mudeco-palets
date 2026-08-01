import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.invoice.count();
  console.log("invoices:", count);
  if (count > 0) return;

  const admin = await prisma.user.findUnique({
    where: { email: "admin@empresa.com" },
  });
  const clients = await prisma.customer.findMany({ take: 3 });
  const catalog = await prisma.product.findMany({
    where: { active: true, NOT: { sku: "CUS-001" } },
    take: 6,
  });
  if (!admin || !clients.length || !catalog.length) {
    console.log("missing base data");
    return;
  }

  const samples = [
    { monthsAgo: 5, idx: 0, qty: 1, paid: true },
    { monthsAgo: 4, idx: 1, qty: 2, paid: true },
    { monthsAgo: 3, idx: 2, qty: 1, paid: true },
    { monthsAgo: 2, idx: 0, qty: 1, paid: false },
    { monthsAgo: 1, idx: 3, qty: 4, paid: true },
    { monthsAgo: 0, idx: 4, qty: 1, paid: false },
    { monthsAgo: 0, idx: 1, qty: 1, paid: true },
  ];

  let n = 1;
  for (const s of samples) {
    const product = catalog[s.idx % catalog.length];
    const customer = clients[n % clients.length];
    const issueDate = new Date();
    issueDate.setMonth(issueDate.getMonth() - s.monthsAgo);
    issueDate.setDate(Math.min(28, 5 + n * 2));

    const lineTotal = product.price * s.qty;
    const tax = Math.round(lineTotal * product.taxRate * 100) / 100;
    const total = Math.round((lineTotal + tax) * 100) / 100;
    const number = `FAC-${issueDate.getFullYear()}-${String(n).padStart(5, "0")}`;

    await prisma.invoice.create({
      data: {
        number,
        status: s.paid ? "PAID" : "ISSUED",
        issueDate,
        subtotal: lineTotal,
        tax,
        total,
        customerId: customer.id,
        userId: admin.id,
        items: {
          create: {
            productId: product.id,
            description: product.name,
            quantity: s.qty,
            unitPrice: product.price,
            taxRate: product.taxRate,
            lineTotal,
          },
        },
        payments: s.paid
          ? {
              create: {
                amount: total,
                method: n % 2 === 0 ? "TRANSFER" : "CASH",
                paidAt: issueDate,
              },
            }
          : undefined,
      },
    });
    n += 1;
  }
  console.log("demo invoices created:", samples.length);
}

main()
  .finally(() => prisma.$disconnect());
