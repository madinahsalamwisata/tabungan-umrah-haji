const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Menghapus riwayat dan rencana tabungan lama...");
    await prisma.riwayatSetoran.deleteMany({});
    await prisma.rencanaTabungan.deleteMany({});
    
    console.log("Memasukkan data dummy paket tabungan...");
    
    const dummyPackages = [
      {
        nama_paket: "Umrah Syawal 1448H (Estimasi)",
        deskripsi_fasilitas: "Estimasi keberangkatan bulan Syawal 1448H. Harga menyesuaikan kondisi saat waktu keberangkatan. \nFasilitas: Hotel Makkah (Bintang 5 atau setaraf), Hotel Madinah (Bintang 4 atau setaraf), City Tour Makkah-Madinah, Pembimbing Ustadz",
        hotel_makkah: "Bintang 5 (Atau Setaraf)",
        hotel_madinah: "Bintang 4 (Atau Setaraf)",
        maskapai: "Saudia / Garuda",
        harga_quad: 28500000,
        harga_triple: 30500000,
        harga_double: 33500000,
        tanggal_keberangkatan: new Date(new Date().setMonth(new Date().getMonth() + 7)), // 7 bulan dari sekarang
        kuota: 45,

      },
      {
        nama_paket: "Umrah Dzulqa'dah 1448H (Estimasi)",
        deskripsi_fasilitas: "Estimasi keberangkatan bulan Dzulqa'dah 1448H dengan maskapai Garuda Indonesia. \nFasilitas: Hotel Makkah (Bintang 4 atau setaraf), Hotel Madinah (Bintang 4 atau setaraf), Makan 3x Sehari, Asuransi",
        hotel_makkah: "Bintang 4 (Atau Setaraf)",
        hotel_madinah: "Bintang 4 (Atau Setaraf)",
        maskapai: "Garuda Indonesia",
        harga_quad: 29000000,
        harga_triple: 31000000,
        harga_double: 34000000,
        tanggal_keberangkatan: new Date(new Date().setMonth(new Date().getMonth() + 8)), // 8 bulan
        kuota: 45,

      },
      {
        nama_paket: "Umrah Spesial Liburan Akhir Tahun 1448H",
        deskripsi_fasilitas: "Estimasi keberangkatan masa liburan sekolah. Kuota terbatas. \nFasilitas: Hotel Makkah (Bintang 5 atau setaraf), Hotel Madinah (Bintang 5 atau setaraf), Kereta Cepat Haramain",
        hotel_makkah: "Bintang 5 (Atau Setaraf)",
        hotel_madinah: "Bintang 5 (Atau Setaraf)",
        maskapai: "Oman Air / Qatar",
        harga_quad: 32000000,
        harga_triple: 34500000,
        harga_double: 37500000,
        tanggal_keberangkatan: new Date(new Date().setMonth(new Date().getMonth() + 9)), // 9 bulan
        kuota: 45,

      },
      {
        nama_paket: "Umrah Dzulhijjah Pra-Haji 1448H",
        deskripsi_fasilitas: "Estimasi keberangkatan awal bulan Dzulhijjah sebelum musim haji. \nFasilitas: Hotel Makkah (Bintang 3 atau setaraf), Hotel Madinah (Bintang 3 atau setaraf), Pesawat Oman Air",
        hotel_makkah: "Bintang 3 (Atau Setaraf)",
        hotel_madinah: "Bintang 3 (Atau Setaraf)",
        maskapai: "Oman Air",
        harga_quad: 27500000,
        harga_triple: 29500000,
        harga_double: 32500000,
        tanggal_keberangkatan: new Date(new Date().setMonth(new Date().getMonth() + 10)), // 10 bulan
        kuota: 45,

      },
      {
        nama_paket: "Umrah Awal Musim Muharram 1449H",
        deskripsi_fasilitas: "Estimasi umrah awal musim setelah pembukaan visa umrah. \nFasilitas: Hotel Makkah (Bintang 4 atau setaraf), Hotel Madinah (Bintang 5 atau setaraf), Pesawat Saudia (Direct Flight)",
        hotel_makkah: "Bintang 4 (Atau Setaraf)",
        hotel_madinah: "Bintang 5 (Atau Setaraf)",
        maskapai: "Saudia Airlines",
        harga_quad: 31000000,
        harga_triple: 33000000,
        harga_double: 36000000,
        tanggal_keberangkatan: new Date(new Date().setMonth(new Date().getMonth() + 11)), // 11 bulan
        kuota: 45,

      }
    ];

    for (const pkg of dummyPackages) {
      pkg.tanggal_kepulangan = new Date(pkg.tanggal_keberangkatan.getTime() + 10 * 24 * 60 * 60 * 1000);
      await prisma.paket.create({ data: pkg });
    }
    
    console.log("Berhasil memasukkan data dummy paket.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
