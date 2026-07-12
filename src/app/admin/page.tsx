import { prisma } from "@/lib/prisma";
import { UsersIcon, WalletIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Ambil data agregasi
  const totalJamaah = await prisma.jamaah.count();
  
  const totalRencana = await prisma.rencanaTabungan.count({
    where: { status: "Aktif" }
  });

  const agregatTabungan = await prisma.rencanaTabungan.aggregate({
    _sum: {
      total_biaya: true
    },
    where: { status: "Aktif" }
  });

  const totalBiaya = Number(agregatTabungan._sum.total_biaya || 0);

  // Ambil riwayat setoran terbaru untuk tabel ringkas
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
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Dashboard Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Ringkasan statistik dan aktivitas pendaftaran jamaah.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative rounded-[1.5rem] shadow-xl overflow-hidden bg-[#0f1712] border border-white/10 p-6">
          <div className="absolute inset-0 bg-cover bg-[center_top] z-0 opacity-20" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1712] via-[#0f1712]/90 to-transparent z-0"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Total Jamaah</p>
              <p className="text-4xl font-bold text-white mt-2">{totalJamaah}</p>
            </div>
            <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl">
              <UsersIcon className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="relative rounded-[1.5rem] shadow-xl overflow-hidden bg-[#0f1712] border border-white/10 p-6">
          <div className="absolute inset-0 bg-cover bg-[center_top] z-0 opacity-20" style={{ backgroundImage: "url('/images/bg/bg-paket.jpeg')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1712] via-[#0f1712]/90 to-transparent z-0"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">Tabungan Aktif</p>
              <p className="text-4xl font-bold text-white mt-2">{totalRencana}</p>
            </div>
            <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="relative rounded-[1.5rem] shadow-xl overflow-hidden bg-[#0f1712] border border-white/10 p-6">
          <div className="absolute inset-0 bg-cover bg-[center_top] z-0 opacity-20" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1712] via-[#0f1712]/90 to-transparent z-0"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400 uppercase tracking-wider">Total Tagihan</p>
              <p className="text-2xl font-bold text-white mt-2">Rp {totalBiaya.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-2xl">
              <WalletIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Setoran Terbaru */}
      <div className="relative rounded-[2rem] shadow-xl overflow-hidden bg-[#0f1712] border border-white/10">
        <div className="absolute inset-0 bg-cover bg-[center_top] z-0 opacity-10" style={{ backgroundImage: "url('/images/bg/bg-paket.jpeg')" }}></div>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>
        
        <div className="relative z-10 px-6 py-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Aktivitas Setoran Terbaru</h3>
            <p className="text-sm text-gray-400 mt-1">Daftar setoran tabungan terakhir dari jamaah.</p>
          </div>
        </div>

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Jamaah</th>
                <th scope="col" className="px-6 py-4 font-semibold">Paket Tujuan</th>
                <th scope="col" className="px-6 py-4 font-semibold">Tanggal Setor</th>
                <th scope="col" className="px-6 py-4 font-semibold">Nominal</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {setoranTerbaru.map((setoran) => (
                <tr key={setoran.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {setoran.rencana_tabungan.jamaah.nama}
                  </td>
                  <td className="px-6 py-4">
                    {setoran.rencana_tabungan.paket.nama_paket}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-semibold">
                    Rp {Number(setoran.nominal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      setoran.status_pembayaran === 'Lunas' || setoran.status_pembayaran === 'settlement'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : setoran.status_pembayaran === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {setoran.status_pembayaran === 'settlement' ? 'Berhasil' : setoran.status_pembayaran}
                    </span>
                  </td>
                </tr>
              ))}
              {setoranTerbaru.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
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
