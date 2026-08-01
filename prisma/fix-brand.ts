import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.companySettings.update({
    where: { id: "default" },
    data: {
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      email: "ventas@mudecopalets.com",
    },
  });
  console.log("company:", company.name);
}

main().finally(() => prisma.$disconnect());
