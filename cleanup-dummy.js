const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pakets = await prisma.paket.findMany();
  
  const toDelete = [];
  let keptReguler = false;
  let keptSpesial = false;
  let keptPlus = false;

  for (const p of pakets) {
    if (p.nama_paket.includes('(Estimasi)')) {
      // keep estimasi packages since they are used in tabungan
      continue;
    }
    
    if (p.nama_paket === 'Umrah Reguler' || p.nama_paket.includes('< 1 Tahun')) {
      if (!keptReguler) {
        keptReguler = true;
      } else {
        toDelete.push(p.id);
      }
      continue;
    }
    
    if (p.nama_paket === 'Umrah Spesial' || p.nama_paket.includes('Tepat > 1 Tahun')) {
      if (!keptSpesial) {
        keptSpesial = true;
      } else {
        toDelete.push(p.id);
      }
      continue;
    }
    
    if (p.nama_paket === 'Umrah Plus' || p.nama_paket.includes('1.5 Tahun')) {
      if (!keptPlus) {
        keptPlus = true;
      } else {
        toDelete.push(p.id);
      }
      continue;
    }

    // If it's anything else (like Umrah Rabiul Akhir), delete it to clean up the view
    toDelete.push(p.id);
  }

  if (toDelete.length > 0) {
    // Delete related RencanaTabungan first if any
    await prisma.rencanaTabungan.deleteMany({
      where: { id_paket: { in: toDelete } }
    });
    
    await prisma.paket.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${toDelete.length} excess packages.`);
  } else {
    console.log('No excess packages to delete.');
  }
}

main().finally(() => prisma.$disconnect());
