const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activePlans = await prisma.rencanaTabungan.findMany({
    where: { status: "Aktif" },
    include: { jamaah: true, RiwayatSetoran: true },
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  let count = 0;

  for (const plan of activePlans) {
    if (!plan.jamaah?.email) continue;
    
    const startDate = new Date(plan.tanggal_mulai);
    let monthsElapsed = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth()) + 1;
    if (monthsElapsed <= 0) continue;
    
    const targetPayments = Math.min(monthsElapsed, plan.periode_bulan);
    const paidCount = plan.RiwayatSetoran.filter(s => s.status_pembayaran === "Sukses").length;
    const unpaidCount = targetPayments - paidCount;

    if (unpaidCount > 0) {
      // Record this jamaah as someone who received the previous blast
      await prisma.riwayatBlast.create({
        data: {
          id_jamaah: plan.id_jamaah,
          jenis_pesan: "Pengingat Cicilan (Sistem Lama)",
          status_email: "Sukses",
          status_wa: "Gagal",
          keterangan_email: "Berhasil dikirim pada percobaan sebelumnya.",
          keterangan_wa: "Fitur WA belum tersedia saat pengiriman sebelumnya.",
          tanggal_kirim: new Date(Date.now() - 3600000) // 1 jam yang lalu
        }
      });
      count++;
    }
  }

  console.log(`Berhasil merekam ${count} riwayat blast sebelumnya.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
