import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding paket umrah...');
  
  const newPaket = await prisma.paket.create({
    data: {
      nama_paket: 'Umrah Rabiul Akhir 1448H',
      tanggal_keberangkatan: new Date('2026-09-26T00:00:00.000Z'),
      tanggal_kepulangan: new Date('2026-10-07T00:00:00.000Z'),
      hotel_makkah: 'Maysan Al Maqam (atau setaraf)',
      hotel_madinah: 'Hayah Golden (atau setaraf)',
      maskapai: 'Saudia Airlines (Direct Flight)',
      harga_quad: 29500000,
      harga_triple: 31500000,
      harga_double: 34650000,
      kuota: 45,
      deskripsi_fasilitas: 'City Tour Makkah-Madinah, kunjungan Museum Ash-Shafiya, City Tour Thaif, pembimbing Ustadz Arbi Fadhli Nurjasmi dan Ustadz Abdul Wahab Mas\'ud',
    },
  });

  console.log('Created new package:', newPaket);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
