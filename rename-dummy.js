const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Find all dummy packages recently added
  const dummies = await prisma.paket.findMany({
    where: {
      OR: [
        { nama_paket: { contains: 'Umrah Reguler (< 1 Tahun)' } },
        { nama_paket: { contains: 'Umrah Spesial (Tepat > 1 Tahun)' } },
        { nama_paket: { contains: 'Umrah Plus (1.5 Tahun)' } }
      ]
    }
  });

  for (const p of dummies) {
    let newName = p.nama_paket;
    if (newName.includes('< 1 Tahun')) newName = 'Umrah Reguler';
    if (newName.includes('Tepat > 1 Tahun')) newName = 'Umrah Spesial';
    if (newName.includes('1.5 Tahun')) newName = 'Umrah Plus';

    await prisma.paket.update({
      where: { id: p.id },
      data: { nama_paket: newName }
    });
  }

  console.log('Dummy packages renamed.');
}

main().finally(() => prisma.$disconnect());
