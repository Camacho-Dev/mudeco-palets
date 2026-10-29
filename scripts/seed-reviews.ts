import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating customer reviews with YouTube features...");

  // Buscar si existe el pedido WEB-2026-00007
  const order = await prisma.webOrder.findFirst({
    where: { number: "WEB-2026-00007" },
  });

  // Limpiar reseñas previas para insertar comentarios enriquecidos estilo YouTube
  await prisma.customerReview.deleteMany({});

  const comments = [
    {
      customerName: "Brayan Francisco De Los Santos Camacho",
      customerEmail: "lamasacre121@gmail.com",
      rating: 5,
      comment: "El banco rústico quedó excelente. Madera de pino curada, muy maciza y los ensambles no tienen ningún juego. El proceso de pago por transferencia fue súper rápido y la atención por WhatsApp de diez.",
      city: "Haina, San Cristóbal",
      productName: "Banco Rústico de Madera de Palets #3",
      orderNumber: "WEB-2026-00007",
      isVerified: true,
      likes: 28,
      dislikes: 0,
      isPinned: true, // Fijado por Mudeco Palets
      officialReply: "¡Muchísimas gracias @brayan_camacho por confiar en nuestro taller artesanal! Nos llena de orgullo que el banco haya quedado justo a tu medida. ¡Que lo disfrutes muchos años!",
      officialReplyAt: new Date("2026-10-28T15:10:00Z"),
      status: "APPROVED",
      webOrderId: order?.id || null,
      createdAt: new Date("2026-10-28T14:30:00Z"),
    },
    {
      customerName: "Ing. Arismendy Peña",
      customerEmail: "arismendy.pena@gmail.com",
      rating: 5,
      comment: "Excelente trabajo de ebanistería. Mandamos a fabricar 6 butacas y una mesa de centro para la terraza y la resistencia a la intemperie ha sido de primera. Tienen acabados profesionales y el color roble oscuro quedó impecable.",
      city: "Santo Domingo Este",
      productName: "Juego de Terraza & Mesa de Centro",
      orderNumber: "WEB-2026-00004",
      isVerified: true,
      likes: 19,
      dislikes: 0,
      isPinned: false,
      officialReply: "¡Gracias ingeniero Arismendy! El sellador marino que le aplicamos al juego de terraza protege contra lluvia y sol caribeño.",
      officialReplyAt: new Date("2026-10-27T19:30:00Z"),
      status: "APPROVED",
      createdAt: new Date("2026-10-27T18:15:00Z"),
    },
    {
      customerName: "Lic. Carolina Méndez",
      customerEmail: "carolina.mendez@outlook.com",
      rating: 5,
      comment: "La base de cama Queen no rechina para nada y el acabado satinado de la madera luce espectacular en nuestra habitación. Entrega puntual y trato muy profesional.",
      city: "Distrito Nacional",
      productName: "Base de Cama Queen Curada",
      orderNumber: "WEB-2026-00002",
      isVerified: true,
      likes: 14,
      dislikes: 0,
      isPinned: false,
      officialReply: null,
      status: "APPROVED",
      createdAt: new Date("2026-10-26T16:45:00Z"),
    },
    {
      customerName: "Marcos Santana",
      customerEmail: "marcos.santana@gmail.com",
      rating: 5,
      comment: "Compré los gaveteros para la habitación principal. Madera 100% curada y tratada contra insectos. Llegaron perfectamente embalados y listos para usar.",
      city: "San Cristóbal",
      productName: "Gavetero Rústico 4 Cajones",
      orderNumber: "WEB-2026-00001",
      isVerified: true,
      likes: 8,
      dislikes: 0,
      isPinned: false,
      officialReply: null,
      status: "APPROVED",
      createdAt: new Date("2026-10-25T11:20:00Z"),
    },
    {
      customerName: "Dra. Patricia Almonte",
      customerEmail: "patricia.almonte@gmail.com",
      rating: 5,
      comment: "Mandé a fabricar un mueble bar esquinero para mi apartamento en Naco y superó mis expectativas. Toda la visita me pregunta dónde lo compré. ¡100% recomendados!",
      city: "Naco, Santo Domingo",
      productName: "Mueble Bar Esquinero Rústico",
      orderNumber: "WEB-2026-00003",
      isVerified: true,
      likes: 11,
      dislikes: 0,
      isPinned: false,
      officialReply: "¡Hola Dra. Patricia! Muchísimas gracias, ese mueble bar es de nuestros diseños favoritos. ¡Salud!",
      officialReplyAt: new Date("2026-10-24T17:00:00Z"),
      status: "APPROVED",
      createdAt: new Date("2026-10-24T15:10:00Z"),
    },
  ];

  for (const c of comments) {
    await prisma.customerReview.create({ data: c });
    console.log(`+ Created comment by ${c.customerName}`);
  }

  console.log("YouTube style comments seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
