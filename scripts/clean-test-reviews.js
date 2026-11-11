const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.customerReview.findMany();
  fs.writeFileSync('scripts/backup-test-reviews.json', JSON.stringify(reviews, null, 2));
  console.log(`Guardado respaldo de ${reviews.length} reseñas en scripts/backup-test-reviews.json`);

  const deleted = await prisma.customerReview.deleteMany();
  console.log(`Eliminadas ${deleted.count} reseñas ficticias de prueba.`);
}

main()
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect());
