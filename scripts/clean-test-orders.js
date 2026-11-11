const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.webOrder.findMany({
    include: { items: true }
  });
  fs.writeFileSync('scripts/backup-test-orders.json', JSON.stringify(orders, null, 2));
  console.log(`Guardado respaldo de ${orders.length} pedidos de prueba en scripts/backup-test-orders.json`);

  // Desvincular facturas y cotizaciones
  await prisma.webOrder.updateMany({
    data: { invoiceId: null, quoteId: null }
  });

  // Borrar items de los pedidos web
  const delItems = await prisma.webOrderItem.deleteMany();
  console.log(`Eliminados ${delItems.count} items de pedidos web de prueba.`);

  // Borrar pedidos web
  const delOrders = await prisma.webOrder.deleteMany();
  console.log(`Eliminados ${delOrders.count} pedidos web de prueba.`);

  // Borrar items de facturas de prueba web
  const webInvoices = await prisma.invoice.findMany({
    where: { source: 'WEB', ncf: null },
    select: { id: true }
  });
  const invIds = webInvoices.map(i => i.id);

  if (invIds.length > 0) {
    const delInvItems = await prisma.invoiceItem.deleteMany({
      where: { invoiceId: { in: invIds } }
    });
    console.log(`Eliminados ${delInvItems.count} items de facturas web de prueba.`);

    const delInvs = await prisma.invoice.deleteMany({
      where: { id: { in: invIds } }
    });
    console.log(`Eliminadas ${delInvs.count} facturas de prueba sin NCF.`);
  }

  // Eliminar el archivo de imagen de prueba si existe
  const demoImagePath = 'public/uploads/comprobantes/comprobante_banco_popular_demo.jpg';
  if (fs.existsSync(demoImagePath)) {
    fs.unlinkSync(demoImagePath);
    console.log('Eliminada imagen de prueba:', demoImagePath);
  }
}

main()
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect());

