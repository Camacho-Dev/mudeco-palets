import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== ENFORCING ONLY ADMIN USER ===");

  // Set lamasacre121@gmail.com and other non-admin accounts back to CLIENTE
  await prisma.user.updateMany({
    where: {
      email: {
        notIn: ["admin@empresa.com", "admin@mudeco.com"],
      },
      role: "ADMIN",
    },
    data: {
      role: "CLIENTE",
    },
  });

  // Ensure admin@empresa.com has ADMIN role
  await prisma.user.updateMany({
    where: {
      email: {
        in: ["admin@empresa.com", "admin@mudeco.com"],
      },
    },
    data: {
      role: "ADMIN",
      active: true,
    },
  });

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
    orderBy: { role: "asc" },
  });

  console.log("\nEstado final de todos los usuarios:");
  console.table(allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
