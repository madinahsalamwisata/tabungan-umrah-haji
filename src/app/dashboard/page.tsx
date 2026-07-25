import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
    include: {
      RencanaTabungan: {
        include: {
          RiwayatSetoran: {
            where: { status_pembayaran: "success" }
          },
          paket: true
        }
      }
    }
  });

  if (!jamaah) {
    redirect("/login");
  }

  // Fetch announcements
  const pengumuman = await prisma.pengumuman.findMany({
    orderBy: [
      { is_penting: 'desc' },
      { created_at: 'desc' }
    ],
    take: 10,
  });

  const serializedPengumuman = pengumuman.map(p => ({
    id: p.id,
    judul: p.judul,
    konten: p.konten,
    is_penting: p.is_penting,
    created_at: p.created_at.toISOString(),
  }));

  // Calculate savings info across active plans
  const activePlans = jamaah.RencanaTabungan.filter(p => p.status === "Aktif");
  
  const savingsPlans = activePlans.map((plan) => {
    const totalTerkumpul = plan.RiwayatSetoran.reduce((sum, item) => sum + Number(item.nominal), 0);
    const targetBiaya = Number(plan.total_biaya);
    const percentage = targetBiaya > 0 ? Math.min(100, Math.round((totalTerkumpul / targetBiaya) * 100)) : 0;
    
    // Target date estimation: tanggal_mulai + periode_bulan
    let formattedTargetDate = "-";
    try {
      const startDate = plan.tanggal_mulai ? new Date(plan.tanggal_mulai) : new Date();
      if (!isNaN(startDate.getTime())) {
        const targetDate = new Date(startDate.getTime());
        targetDate.setMonth(targetDate.getMonth() + (Number(plan.periode_bulan) || 12));
        if (!isNaN(targetDate.getTime())) {
          formattedTargetDate = targetDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
        }
      }
    } catch {
      formattedTargetDate = "-";
    }
    const cicilanKe = plan.RiwayatSetoran.length + 1;

    return {
      namaPaket: plan.paket?.is_estimasi || plan.paket?.nama_paket?.includes("(Estimasi)") || plan.paket_snapshot_is_estimasi
        ? (plan.paket?.nama_paket || plan.paket_snapshot_nama || 'Paket Umrah').replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim()
        : (plan.paket?.nama_paket || plan.paket_snapshot_nama || 'Paket Umrah'),
      totalTerkumpul,
      targetBiaya,
      percentage,
      formattedTargetDate,
      idRencana: plan.id,
      jenisKamar: plan.jenis_kamar,
      jumlahJamaah: plan.jumlah_jamaah,
      cicilanKe
    };
  });

  return (
    <DashboardClient 
      initialPengumuman={serializedPengumuman} 
      userNama={jamaah.nama}
      savingsPlans={savingsPlans}
    />
  );
}
