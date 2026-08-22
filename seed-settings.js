const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultTentangKamiSections = [
  {
    id: "sec_1",
    title: "Visi Kami",
    content: "Menjadi biro perjalanan ibadah umrah dan haji pilihan utama umat Islam di Indonesia yang terpercaya, amanah, dan memberikan layanan prima serta pengalaman ibadah yang khusyuk dan tak terlupakan.",
    isList: false
  },
  {
    id: "sec_2",
    title: "Misi Kami",
    content: "1. Memberikan bimbingan ibadah sesuai dengan tuntunan Al-Qur'an dan Sunnah.\n2. Mengutamakan kenyamanan dan keamanan jamaah selama di Tanah Suci.\n3. Menjalin kemitraan dengan maskapai dan hotel terbaik.\n4. Menyiapkan pembimbing (Muthawwif) yang berpengalaman dan berilmu.",
    isList: true
  }
];

const defaultSyaratKetentuanSections = [
  {
    id: "pendaftaran",
    title: "Syarat Pendaftaran",
    content: "1. Mengisi formulir pendaftaran.\n2. Menyerahkan paspor asli dengan masa berlaku minimal 8 bulan.\n3. Pas foto berwarna ukuran 4x6 (2 lembar) background putih, fokus wajah 80%.\n4. Membayar DP atau setoran awal sesuai ketentuan.",
    isList: true
  },
  {
    id: "alur-pembayaran",
    title: "Ketentuan Pembayaran",
    content: "1. Seluruh pembayaran menggunakan mata uang Rupiah.\n2. Transfer hanya ditujukan ke rekening resmi perusahaan.\n3. Jamaah wajib mengirimkan bukti transfer untuk validasi.",
    isList: true
  },
  {
    id: "pembatalan",
    title: "Kebijakan Pembatalan",
    content: "1. Pembatalan setelah proses visa akan dikenakan biaya administrasi.\n2. Pembatalan 1 bulan sebelum keberangkatan dikenakan potongan 50%.\n3. Pembatalan kurang dari 2 minggu hangus atau disesuaikan dengan kebijakan maskapai.",
    isList: true
  }
];

async function main() {
  const settings = [
    { key: "tentang_kami_company_name", value: "PT Madinah Salam Wisata" },
    { key: "tentang_kami_description", value: "Penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami berkomitmen memberikan pengalaman ibadah terbaik bagi tamu-tamu Allah ﷻ." },
    { key: "tentang_kami_ppiu_no", value: "03012400173490004" },
    { key: "tentang_kami_sections", value: JSON.stringify(defaultTentangKamiSections) },
    { key: "syarat_ketentuan_sections", value: JSON.stringify(defaultSyaratKetentuanSections) }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }
  
  console.log("Settings seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
