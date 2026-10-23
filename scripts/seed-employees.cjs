const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Existing users count:', users.length);

  for (const u of users) {
    if (u.role === 'ADMIN' && !u.position) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          position: 'Director General & Operaciones',
          department: 'ADMINISTRACION',
          idCard: '001-0987654-3',
          phone: '809-555-0101',
          salary: 65000,
          bankName: 'Banco Popular Dominicano',
          bankAccount: '7920145623',
          address: 'Av. Luperón, Santo Domingo Oeste',
          emergencyContact: 'María Santos (Esposa) 829-555-0199',
          hireDate: new Date('2023-01-15'),
          notes: 'Fundador y administrador general de Mudeco Palets.',
        },
      });
    } else if (!u.position) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          position: 'Asesor de Ventas & Mostrador',
          department: 'VENTAS',
          idCard: '001-1827364-5',
          phone: '829-555-0122',
          salary: 22000,
          commissionRate: 0.03,
          bankName: 'Banreservas',
          bankAccount: '9602345127',
          address: 'Herrera, Santo Domingo Oeste',
          emergencyContact: 'Pedro Gómez (Hermano) 809-555-0188',
          hireDate: new Date('2024-03-01'),
          notes: 'Encargado de atención al cliente en tienda física y seguimiento a pedidos web.',
        },
      });
    }
  }

  const existingTaller = await prisma.user.findFirst({ where: { email: 'rafael.ebanista@mudeco.com' } });
  if (!existingTaller) {
    const hash = await bcrypt.hash('mudeco123', 10);
    await prisma.user.create({
      data: {
        name: 'Rafael Alcántara',
        email: 'rafael.ebanista@mudeco.com',
        passwordHash: hash,
        role: 'VENDEDOR',
        position: 'Maestro Ebanista & Jefe de Taller',
        department: 'TALLER',
        idCard: '001-1452367-9',
        phone: '809-555-0177',
        salary: 38000,
        bankName: 'Banco BHD',
        bankAccount: '1023495812',
        address: 'Los Alcarrizos, Santo Domingo',
        emergencyContact: 'Rosa Alcántara (Hija) 829-555-0133',
        hireDate: new Date('2023-06-10'),
        notes: 'Especialista en tratamiento de palets, ensambles ocultos y acabado rústico.',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Carlos Manuel Méndez',
        email: 'carlos.taller@mudeco.com',
        passwordHash: hash,
        role: 'VENDEDOR',
        position: 'Carpintero Armador & Lijador',
        department: 'TALLER',
        idCard: '001-0876543-2',
        phone: '829-555-0144',
        salary: 26000,
        bankName: 'Banreservas',
        bankAccount: '9608871234',
        address: 'Bayona, Santo Domingo Oeste',
        emergencyContact: 'Carmen Méndez (Madre) 809-555-0166',
        hireDate: new Date('2024-01-20'),
        notes: 'Encargado de cortes, lijado fino y aplicación de sellador y barniz.',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Dario Antonio Peña',
        email: 'dario.entregas@mudeco.com',
        passwordHash: hash,
        role: 'VENDEDOR',
        position: 'Chofer & Encargado de Logística',
        department: 'LOGISTICA',
        idCard: '001-1928374-6',
        phone: '849-555-0155',
        salary: 24000,
        bankName: 'Banco Popular Dominicano',
        bankAccount: '7928812345',
        address: 'Manoguayabo, Santo Domingo Oeste',
        emergencyContact: 'Juana Peña (Esposa) 829-555-0177',
        hireDate: new Date('2024-02-15'),
        notes: 'Licencia de conducir categoría 3. Responsable de entregas a domicilio e instalación.',
      },
    });
  }

  const finalUsers = await prisma.user.findMany();
  console.log('Seeding completed. Total employees in system:', finalUsers.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
