import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch aggregation data
  const totalAkun = await prisma.jamaah.count({
    where: { email: { not: "madinahsalamwisata@gmail.com" } }
  });
  
  // Calculate Jamaah Estimasi: sum of jumlah_jamaah of all active plans
  const sumJamaah = await prisma.rencanaTabungan.aggregate({
    _sum: {
      jumlah_jamaah: true
    },
    where: { status: "Aktif" }
  });
  const jamaahEstimasi = Number(sumJamaah._sum.jumlah_jamaah || 0);

  // Total Setor: sum of payments where status is success/settlement/Lunas
  const sumSetor = await prisma.riwayatSetoran.aggregate({
    _sum: {
      nominal: true
    },
    where: {
      status_pembayaran: {
        in: ["success", "settlement", "Lunas"]
      }
    }
  });
  const totalSetor = Number(sumSetor._sum.nominal || 0);

  // Total Refund: sum of payments where status is refund/refunded
  const sumRefund = await prisma.riwayatSetoran.aggregate({
    _sum: {
      nominal: true
    },
    where: {
      status_pembayaran: {
        in: ["refund", "refunded"]
      }
    }
  });
  const totalRefund = Number(sumRefund._sum.nominal || 0);

  // Total Tagihan: sum of total_biaya of active savings plans
  const agregatTabungan = await prisma.rencanaTabungan.aggregate({
    _sum: {
      total_biaya: true
    },
    where: { status: "Aktif" }
  });
  const totalBiaya = Number(agregatTabungan._sum.total_biaya || 0);

  // Fetch all recent transactions for the client table search/scroll
  const setoranTerbaru = await prisma.riwayatSetoran.findMany({
    orderBy: { tanggal_setor: 'desc' },
    include: {
      rencana_tabungan: {
        include: {
          jamaah: true,
          paket: true
        }
      }
    }
  });

  const serializedSetoran = setoranTerbaru.map((s) => ({
    id: s.id,
    nominal: Number(s.nominal),
    tanggal_setor: s.tanggal_setor.toISOString(),
    status_pembayaran: s.status_pembayaran,
    rencana_tabungan: {
      id: s.rencana_tabungan.id,
      paket_nama: s.rencana_tabungan.paket?.nama_paket || (s.rencana_tabungan as any).paket_snapshot_nama || "Paket Dihapus",
      jamaah: {
        id: s.rencana_tabungan.jamaah.id,
        nama: s.rencana_tabungan.jamaah.nama,
        nik: s.rencana_tabungan.jamaah.nik,
        foto_url: s.rencana_tabungan.jamaah.foto_url
      }
    }
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-head">
        <h1 className="text-2xl font-bold text-teks-900">Dashboard Admin</h1>
        <p className="text-sm text-teks-500 mt-1">Ringkasan statistik dan aktivitas pendaftaran jamaah.</p>
      </div>

      {/* Stats Cards Row (Horizontal Slider Layout) */}
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-emerald-800/10 scrollbar-track-transparent">
        {/* Total Akun */}
        <div className="min-w-[260px] bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between snap-start flex-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teks-500">Total Akun</span>
            <div className="text-3xl font-bold text-teks-900 mt-2">{totalAkun}</div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#EFEAFB] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-[#6D4FC9] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* Jamaah (Estimasi) */}
        <div className="min-w-[260px] bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between snap-start flex-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teks-500">Jamaah (Estimasi)</span>
            <div className="text-3xl font-bold text-teks-900 mt-2">{jamaahEstimasi}</div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FBF1DF] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-emas-deep stroke-2 fill-none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
        </div>

        {/* Total Setor */}
        <div className="min-w-[260px] bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between snap-start flex-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teks-500">Total Setor</span>
            <div className="text-2xl font-bold text-hijau-900 mt-2" title={`Rp ${totalSetor.toLocaleString('id-ID')}`}>
              Rp {(totalSetor / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-hijau-100 flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-hijau-800 stroke-2 fill-none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        {/* Total Refund */}
        <div className="min-w-[260px] bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between snap-start flex-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teks-500">Total Refund</span>
            <div className="text-2xl font-bold text-[#B3423A] mt-2" title={`Rp ${totalRefund.toLocaleString('id-ID')}`}>
              Rp {(totalRefund / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FBEAE8] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-[#B3423A] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        {/* Total Tagihan */}
        <div className="min-w-[260px] bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between snap-start flex-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teks-500">Total Tagihan</span>
            <div className="text-2xl font-bold text-teks-900 mt-2" title={`Rp ${totalBiaya.toLocaleString('id-ID')}`}>
              Rp {(totalBiaya / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-hijau-100 flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-hijau-800 stroke-2 fill-none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>
          </div>
        </div>
      </div>

      {/* Aktivitas Transaksi Panel */}
      <AdminDashboardClient initialSetoran={serializedSetoran} />
    </div>
  );
}
