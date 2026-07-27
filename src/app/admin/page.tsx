import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch aggregation data
  const totalAkun = await prisma.jamaah.count({
    where: { email: { not: "madinahsalamwisata@gmail.com" } }
  });
  
  const jamaahPasti = await prisma.rencanaTabungan.count({
    where: { 
      status: "Aktif",
      paket: { is_estimasi: false }
    }
  });

  const jamaahEstimasi = await prisma.rencanaTabungan.count({
    where: { 
      status: "Aktif",
      paket: { is_estimasi: true }
    }
  });

  const agregatTabungan = await prisma.rencanaTabungan.aggregate({
    _sum: {
      total_biaya: true
    },
    where: { status: "Aktif" }
  });

  const totalBiaya = Number(agregatTabungan._sum.total_biaya || 0);

  // Fetch recent payments for table summary
  const setoranTerbaru = await prisma.riwayatSetoran.findMany({
    take: 5,
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-head">
        <h1 className="text-2xl font-bold text-teks-900">Dashboard Admin</h1>
        <p className="text-sm text-teks-500 mt-1">Ringkasan statistik dan aktivitas pendaftaran jamaah.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Akun */}
        <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-teks-500">Total Akun</span>
            <div className="text-3xl font-bold text-teks-900 mt-2.5">{totalAkun}</div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#EFEAFB] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-[#6D4FC9] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* Jamaah Pasti */}
        <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-teks-500">Jamaah (Pasti)</span>
            <div className="text-3xl font-bold text-teks-900 mt-2.5">{jamaahPasti}</div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-hijau-100 flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-hijau-800 stroke-2 fill-none" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* Jamaah Estimasi */}
        <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-teks-500">Jamaah (Estimasi)</span>
            <div className="text-3xl font-bold text-teks-900 mt-2.5">{jamaahEstimasi}</div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FBF1DF] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-emas-deep stroke-2 fill-none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
        </div>

        {/* Total Tagihan */}
        <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex items-start justify-between">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-teks-500">Total Tagihan</span>
            <div className="text-xl lg:text-2xl font-bold text-teks-900 mt-3 truncate" title={`Rp ${totalBiaya.toLocaleString('id-ID')}`}>
              Rp {(totalBiaya / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="w-[42px] h-[42px] rounded-xl bg-[#FBEAE8] flex items-center justify-center shrink-0">
            <svg className="w-[19px] h-[19px] stroke-[#B3423A] stroke-2 fill-none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>
          </div>
        </div>
      </div>

      {/* Setoran Terbaru Panel */}
      <div className="bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] overflow-hidden">
        <div className="px-6 py-6 border-b border-garis bg-white text-left">
          <h3 className="text-base font-bold text-teks-900">Aktivitas Setoran Terbaru</h3>
          <p className="text-xs text-teks-500 mt-1">Daftar setoran tabungan terakhir dari jamaah.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-garis">
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300">Jamaah</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300">Paket Tujuan</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300">Tanggal Setor</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300">Nominal</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {setoranTerbaru.map((setoran) => {
                const isSuccess = setoran.status_pembayaran === 'Lunas' || setoran.status_pembayaran === 'settlement' || setoran.status_pembayaran === 'success';
                const isPending = setoran.status_pembayaran === 'pending';
                
                return (
                  <tr key={setoran.id} className="hover:bg-krem/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {setoran.rencana_tabungan.jamaah.foto_url ? (
                          <img 
                            src={setoran.rencana_tabungan.jamaah.foto_url} 
                            alt={setoran.rencana_tabungan.jamaah.nama} 
                            className="w-[34px] h-[34px] rounded-full object-cover shrink-0 border border-garis"
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-white text-[12px] bg-gradient-to-br from-hijau-700 to-hijau-900 shrink-0">
                            {setoran.rencana_tabungan.jamaah.nama?.[0] || "J"}
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-bold text-teks-900">{setoran.rencana_tabungan.jamaah.nama}</div>
                          <div className="text-[10px] text-teks-500 mt-0.5">NIK {setoran.rencana_tabungan.jamaah.nik}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-teks-900 text-left">
                      {setoran.rencana_tabungan.paket?.nama_paket || (setoran.rencana_tabungan as any).paket_snapshot_nama || "Paket Dihapus"}
                    </td>
                    <td className="px-6 py-4 text-teks-500 text-left">
                      {new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-hijau-900 font-bold text-left">
                      Rp {Number(setoran.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className={`status-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide border ${
                        isSuccess
                          ? 'bg-hijau-100 text-hijau-800 border-hijau-200/50'
                          : isPending
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200/50'
                          : 'bg-red-50 text-red-600 border-red-100/50'
                      }`}>
                        {isSuccess ? 'Success' : setoran.status_pembayaran}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {setoranTerbaru.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-teks-300 italic">
                    Belum ada riwayat setoran terbaru
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
