import { prisma } from "@/lib/prisma";

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

function UsersIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function WalletIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function DocumentTextIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
