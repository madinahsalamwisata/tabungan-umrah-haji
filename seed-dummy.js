const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Package < 1 year (e.g., 6 months from now)
  const d1 = new Date(now);
  d1.setMonth(d1.getMonth() + 6);
  const r1 = new Date(d1);
  r1.setDate(r1.getDate() + 9);

  // Package exactly 1 year from now (add 1 year, and exactly on the same day)
  const d2 = new Date(now);
  d2.setFullYear(d2.getFullYear() + 1);
  d2.setDate(d2.getDate() + 1); // +1 day just to be fully > 1 year based on pure time
  const r2 = new Date(d2);
  r2.setDate(r2.getDate() + 9);

  // Package 1.5 years from now
  const d3 = new Date(now);
  d3.setFullYear(d3.getFullYear() + 1);
  d3.setMonth(d3.getMonth() + 6);
  const r3 = new Date(d3);
  r3.setDate(r3.getDate() + 12);

  await prisma.paket.createMany({
    data: [
      {
        nama_paket: 'Umrah Reguler (< 1 Tahun)',
        tanggal_keberangkatan: d1,
        tanggal_kepulangan: r1,
        hotel_makkah: 'Bintang 4 (Atau Setaraf)',
        hotel_madinah: 'Bintang 4 (Atau Setaraf)',
        maskapai: 'Saudia Airlines',
        harga_quad: 28500000,
        harga_double: 32000000,
        harga_triple: 30000000,
        kuota: 45,
      },
      {
        nama_paket: 'Umrah Spesial (Tepat > 1 Tahun)',
        tanggal_keberangkatan: d2,
        tanggal_kepulangan: r2,
        hotel_makkah: 'Bintang 5 (Atau Setaraf)',
        hotel_madinah: 'Bintang 5 (Atau Setaraf)',
        maskapai: 'Garuda Indonesia',
        harga_quad: 32500000,
        harga_double: 36000000,
        harga_triple: 34000000,
        kuota: 45,
      },
      {
        nama_paket: 'Umrah Plus (1.5 Tahun)',
        tanggal_keberangkatan: d3,
        tanggal_kepulangan: r3,
        hotel_makkah: 'Bintang 5 (Atau Setaraf)',
        hotel_madinah: 'Bintang 5 (Atau Setaraf)',
        maskapai: 'Qatar Airways',
        harga_quad: 35500000,
        harga_double: 39000000,
        harga_triple: 37000000,
        kuota: 45,
      }
    ]
  });
  console.log('Dummy data inserted');
}

main().finally(() => prisma.$disconnect());
