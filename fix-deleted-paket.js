const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create the deleted paket manually
  const deletedPaket = await prisma.paket.create({
    data: {
      nama_paket: "Umrah Spesial (Contoh)",
      tanggal_keberangkatan: new Date("2027-07-12T00:00:00.000Z"),
      tanggal_kepulangan: new Date("2027-07-21T00:00:00.000Z"),
      hotel_makkah: "Bintang 5 (Atau Setaraf)",
      hotel_madinah: "Bintang 5 (Atau Setaraf)",
      maskapai: "Garuda Indonesia",
      harga_quad: 32500000,
      harga_double: 36000000,
      harga_triple: 34000000,
      kuota: 45,
      is_deleted: true
    }
  });

  console.log("Created deleted paket:", deletedPaket.id);

  // 2. Re-link RencanaTabungan that have paket_snapshot_nama === 'Umrah Spesial (Contoh)' and id_paket === null
  const updated = await prisma.rencanaTabungan.updateMany({
    where: {
      paket_snapshot_nama: "Umrah Spesial (Contoh)",
      id_paket: null
    },
    data: {
      id_paket: deletedPaket.id
    }
  });

  console.log("Re-linked plans:", updated.count);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
