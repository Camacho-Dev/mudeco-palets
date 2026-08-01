import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      email: "admin@empresa.com",
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "vendedor@empresa.com" },
    update: {},
    create: {
      email: "vendedor@empresa.com",
      name: "Vendedor",
      passwordHash: await bcrypt.hash("vendedor123", 10),
      role: "VENDEDOR",
    },
  });

  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      email: "ventas@mudecopalets.com",
    },
    create: {
      id: "default",
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      taxId: process.env.COMPANY_TAX_ID || "130000000",
      address: "Santo Domingo, República Dominicana",
      phone: "809-555-0100",
      email: "ventas@mudecopalets.com",
    },
  });

  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          name: "Cliente Contado",
          taxId: null,
          phone: "",
          address: "",
        },
        {
          name: "Residencial Palma Real",
          taxId: "101234567",
          email: "compras@palmareal.com",
          phone: "809-555-1001",
          address: "Santo Domingo Este",
        },
        {
          name: "María Rodríguez",
          taxId: "00112345678",
          phone: "829-555-2002",
          address: "Santiago",
        },
      ],
    });
  }

  const hasFurniture = await prisma.product.findFirst({
    where: { sku: "SOF-001" },
  });
  if (!hasFurniture) {
    await prisma.invoiceItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.product.deleteMany();
    await prisma.product.createMany({
      data: [
        {
          sku: "SOF-001",
          name: "Sofá 3 plazas tela",
          description: "Fabricación propia — tela antimancha",
          category: "Sala",
          price: 28500,
          cost: 16000,
          taxRate: 0.18,
          unit: "UND",
          stock: 8,
          minStock: 2,
        },
        {
          sku: "SOF-002",
          name: "Sofá esquinero L",
          description: "A medida — espuma alta densidad",
          category: "Sala",
          price: 42000,
          cost: 24000,
          taxRate: 0.18,
          unit: "UND",
          stock: 4,
          minStock: 1,
        },
        {
          sku: "CAM-001",
          name: "Cama queen madera",
          description: "Cabecero tapizado — pino tratado",
          category: "Dormitorio",
          price: 32000,
          cost: 18000,
          taxRate: 0.18,
          unit: "UND",
          stock: 6,
          minStock: 2,
        },
        {
          sku: "CAM-002",
          name: "Closet 6 puertas",
          description: "Melamina / madera — a medida",
          category: "Dormitorio",
          price: 45000,
          cost: 26000,
          taxRate: 0.18,
          unit: "UND",
          stock: 3,
          minStock: 1,
        },
        {
          sku: "COM-001",
          name: "Mesa comedor 6 puestos",
          description: "Tapa sólida — sillas aparte",
          category: "Comedor",
          price: 22000,
          cost: 12000,
          taxRate: 0.18,
          unit: "UND",
          stock: 5,
          minStock: 2,
        },
        {
          sku: "COM-002",
          name: "Silla comedor tapizada",
          description: "Estructura madera — asiento tela",
          category: "Comedor",
          price: 4500,
          cost: 2200,
          taxRate: 0.18,
          unit: "UND",
          stock: 24,
          minStock: 6,
        },
        {
          sku: "OFI-001",
          name: "Escritorio ejecutivo",
          description: "Fabricación propia — 1.60 m",
          category: "Oficina",
          price: 18500,
          cost: 9500,
          taxRate: 0.18,
          unit: "UND",
          stock: 7,
          minStock: 2,
        },
        {
          sku: "CUS-001",
          name: "Mueble a medida (presupuesto)",
          description: "Diseño y fabricación personalizada",
          category: "A medida",
          price: 0,
          cost: 0,
          taxRate: 0.18,
          unit: "UND",
          stock: 999,
          minStock: 0,
        },
      ],
    });
  }

  const invoiceCount = await prisma.invoice.count();
  if (invoiceCount === 0) {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@empresa.com" },
    });
    const clients = await prisma.customer.findMany({ take: 3 });
    const catalog = await prisma.product.findMany({
      where: { active: true, NOT: { sku: "CUS-001" } },
      take: 6,
    });

    if (admin && clients.length && catalog.length) {
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

        const inv = await prisma.invoice.create({
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
        void inv;
        n += 1;
      }
    }
  }

  const ncfCount = await prisma.ncfSeries.count();
  if (ncfCount === 0) {
    await prisma.ncfSeries.createMany({
      data: [
        {
          type: "B01",
          name: "Crédito fiscal",
          prefix: "B01",
          nextSeq: 1,
          maxSeq: 99999999,
          active: true,
        },
        {
          type: "B02",
          name: "Consumidor final",
          prefix: "B02",
          nextSeq: 1,
          maxSeq: 99999999,
          active: true,
        },
      ],
    });
  }

  const materialCount = await prisma.product.count({
    where: { kind: "MATERIAL" },
  });
  if (materialCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          kind: "MATERIAL",
          sku: "MAD-PINO",
          name: "Tabla pino 1x6",
          category: "Madera",
          unit: "PIE",
          cost: 85,
          price: 0,
          taxRate: 0,
          stock: 120,
          minStock: 40,
        },
        {
          kind: "MATERIAL",
          sku: "MAD-ROBLE",
          name: "Tabla roble",
          category: "Madera",
          unit: "PIE",
          cost: 180,
          price: 0,
          taxRate: 0,
          stock: 60,
          minStock: 20,
        },
        {
          kind: "MATERIAL",
          sku: "TOR-8x1",
          name: "Tornillos 8x1 caja",
          category: "Tornillería",
          unit: "CAJA",
          cost: 250,
          price: 0,
          taxRate: 0,
          stock: 15,
          minStock: 5,
        },
        {
          kind: "MATERIAL",
          sku: "HER-BIS",
          name: "Bisagras estándar",
          category: "Herrajes",
          unit: "UND",
          cost: 45,
          price: 0,
          taxRate: 0,
          stock: 80,
          minStock: 20,
        },
        {
          kind: "MATERIAL",
          sku: "BAR-POLI",
          name: "Barniz poliuretano",
          category: "Pintura / barniz",
          unit: "LT",
          cost: 650,
          price: 0,
          taxRate: 0,
          stock: 12,
          minStock: 4,
        },
        {
          kind: "MATERIAL",
          sku: "PEG-PVAC",
          name: "Pegamento PVAc",
          category: "Pegamento",
          unit: "LT",
          cost: 320,
          price: 0,
          taxRate: 0,
          stock: 8,
          minStock: 3,
        },
        {
          kind: "MATERIAL",
          sku: "ESP-2",
          name: "Espuma densidad media",
          category: "Espuma / tela",
          unit: "M2",
          cost: 420,
          price: 0,
          taxRate: 0,
          stock: 25,
          minStock: 8,
        },
      ],
    });
  }

  console.log("Seed OK — Mudeco Palets | admin@empresa.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
