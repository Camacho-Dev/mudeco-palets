import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const MUDECO_CATALOG = [
  {
    sku: "MESA-CENTRO-01",
    name: "Mesa de centro rústica",
    category: "MESA DE CENTRO",
    description:
      "Mesa de centro en madera recuperada, acabado natural y carácter artesanal.",
    price: 8500,
    stock: 6,
    imageUrl: "/brand/cat-mesa.jpg",
  },
  {
    sku: "MESA-COMEDOR-01",
    name: "Mesa de comedor palet",
    category: "MESA DE COMEDOR",
    description: "Comedor sólido de madera recuperada, ideal para 6 personas.",
    price: 24500,
    stock: 3,
    imageUrl: "/brand/cat-mesa.jpg",
  },
  {
    sku: "TV-01",
    name: "Repisa de TV industrial",
    category: "REPISA DE TV",
    description: "Mueble TV bajo con almacenamiento y veta natural.",
    price: 12500,
    stock: 5,
    imageUrl: "/brand/cat-tv.jpg",
  },
  {
    sku: "NOCHE-01",
    name: "Mesa de noche",
    category: "MESA DE NOCHE",
    description: "Mesa de noche compacta en madera recuperada.",
    price: 4500,
    stock: 8,
    imageUrl: "/brand/cat-noche.jpg",
  },
  {
    sku: "BANCO-01",
    name: "Banco de entrada",
    category: "BANCO",
    description: "Banco robusto para recibidor o terraza.",
    price: 6800,
    stock: 7,
    imageUrl: "/brand/cat-banco.jpg",
  },
  {
    sku: "VINERA-01",
    name: "Vinera de pared",
    category: "VINERA",
    description: "Vinera artesanal para botellas y copas.",
    price: 9200,
    stock: 4,
    imageUrl: "/brand/cat-vinera.jpg",
  },
  {
    sku: "REPISA-ENT-01",
    name: "Repisa de entrada",
    category: "REPISA DE ENTRADA",
    description: "Repisa con ganchos y estante para el recibidor.",
    price: 7800,
    stock: 5,
    imageUrl: "/brand/cat-tv.jpg",
  },
  {
    sku: "CAMA-01",
    name: "Base de cama queen",
    category: "BASE DE CAMA",
    description: "Base de cama en madera recuperada, estructura reforzada.",
    price: 18500,
    stock: 2,
    imageUrl: "/brand/cat-noche.jpg",
  },
  {
    sku: "GAV-01",
    name: "Gavetero 4 cajones",
    category: "GAVETEROS",
    description: "Gavetero con tiradores metálicos y acabado mate.",
    price: 14200,
    stock: 3,
    imageUrl: "/brand/cat-tv.jpg",
  },
  {
    sku: "BUTACA-01",
    name: "Butaca haragana",
    category: "SILLA HARAGANA",
    description: "Butaca reclinable de madera recuperada.",
    price: 9800,
    stock: 4,
    imageUrl: "/brand/cat-banco.jpg",
  },
  {
    sku: "MESA-CENTRO-02",
    name: "Mesa de centro cuadrada",
    category: "MESA DE CENTRO",
    description: "Mesa cuadrada con patas en X y tablones recuperados.",
    price: 7900,
    stock: 5,
    imageUrl: "/brand/cat-mesa.jpg",
  },
  {
    sku: "TV-02",
    name: "Mueble TV flotante",
    category: "REPISA DE TV",
    description: "Consola TV flotante con acabado barniz mate.",
    price: 11200,
    stock: 4,
    imageUrl: "/brand/cat-tv.jpg",
  },
] as const;

async function main() {
  const p = new PrismaClient();
  try {
    // Desactivar genéricos que no son marca Mudeco
    await p.product.updateMany({
      where: {
        OR: [
          { name: { contains: "Sofá", mode: "insensitive" } },
          { name: { contains: "Sofa", mode: "insensitive" } },
          { name: { contains: "Closet", mode: "insensitive" } },
          { name: { contains: "Colchón", mode: "insensitive" } },
          { name: { contains: "Colchon", mode: "insensitive" } },
          { category: { in: ["Sala", "Dormitorio", "Oficina"] } },
        ],
      },
      data: { active: false },
    });

    for (const item of MUDECO_CATALOG) {
      const existing = await p.product.findFirst({
        where: { sku: item.sku },
      });
      if (existing) {
        await p.product.update({
          where: { id: existing.id },
          data: {
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price,
            stock: item.stock,
            imageUrl: item.imageUrl,
            active: true,
            kind: "FINISHED",
          },
        });
      } else {
        await p.product.create({
          data: {
            sku: item.sku,
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price,
            cost: Math.round(item.price * 0.45),
            stock: item.stock,
            imageUrl: item.imageUrl,
            active: true,
            kind: "FINISHED",
            taxRate: 0.18,
          },
        });
      }
    }

    const count = await p.product.count({
      where: { active: true, kind: "FINISHED" },
    });
    console.log(`ok — ${count} productos activos Mudeco`);
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
