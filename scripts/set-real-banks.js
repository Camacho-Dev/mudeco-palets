const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accounts = [
  {
    bank: 'Banco Popular Dominicano',
    type: 'Cuenta Corriente en DOP',
    accountNumber: '0854076668',
    holder: 'Martín González',
    rnc: '',
    color: '#0047ba'
  },
  {
    bank: 'Banreservas (Banco de Reservas)',
    type: 'Cuenta de Ahorros en DOP',
    accountNumber: '9609158003',
    holder: 'Martín González',
    rnc: '',
    color: '#0072ce'
  },
  {
    bank: 'Banco BHD',
    type: 'Cuenta de Ahorros en DOP',
    accountNumber: '14660720010',
    holder: 'Martín González',
    rnc: '',
    color: '#008852'
  },
  {
    bank: 'Asociación Popular (APAP)',
    type: 'Cuenta de Ahorros en DOP',
    accountNumber: '1020930098',
    holder: 'Martín González',
    rnc: '',
    color: '#d97706'
  },
  {
    bank: 'Banesco Banco Múltiple',
    type: 'Cuenta de Ahorros en DOP',
    accountNumber: '11200066282',
    holder: 'Martín González',
    rnc: '',
    color: '#006940'
  }
];

async function main() {
  const json = JSON.stringify(accounts);
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: { bankAccountsJson: json },
    create: { id: 'default', bankAccountsJson: json }
  });
  console.log('¡Guardadas exitosamente las 5 cuentas bancarias reales de Martín González en CompanySettings!');
}

main()
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect());

