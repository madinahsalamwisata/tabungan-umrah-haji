import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TabunganDashboardClient from "@/components/tabungan/TabunganDashboardClient";
import TabunganSearchClient from "@/components/tabungan/TabunganSearchClient";

export default async function TabunganDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
  });

  if (!jamaah) {
    redirect("/login");
  }

  // Ambil semua rencana tabungan aktif jamaah
  const rencanaTabunganList = await prisma.rencanaTabungan.findMany({
    where: { id_jamaah: jamaah.id },
    include: {
      paket: true,
      RiwayatSetoran: {
        orderBy: { bulan_ke: 'asc' }
      }
    },
    orderBy: { tanggal_mulai: 'desc' }
  });

  // Ambil semua paket yang jadwalnya >= 6 bulan ke depan
  const now = new Date();
  const futurePakets = await prisma.paket.findMany({
    orderBy: { tanggal_keberangkatan: 'asc' }
  });
  
  // Filter > 6 bulan (hanya perkiraan / estimasi yang ditabung) dan serialize Decimal
  const estimasiPakets = futurePakets.filter(p => {
     const depart = p.tanggal_keberangkatan;
     const diffInMonths = (depart.getFullYear() - now.getFullYear()) * 12 + (depart.getMonth() - now.getMonth());
     return diffInMonths >= 6;
  }).map(p => ({
     ...p,
     harga_quad: p.harga_quad.toString(),
     harga_triple: p.harga_triple.toString(),
     harga_double: p.harga_double.toString(),
  }));

  const activePaketIds = rencanaTabunganList.map(r => r.id_paket);

  if (rencanaTabunganList.length === 0) {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-emerald-900/40 backdrop-blur-md rounded-xl p-6 border border-emerald-500/30 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2">Belum Ada Rencana Tabungan</h2>
          <p className="text-emerald-200">Pilih estimasi paket umrah di bawah ini untuk mulai menabung.</p>
        </div>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-emerald-900/60 to-black/40 backdrop-blur-xl border border-emerald-500/30 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white drop-shadow-md mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Rencana Tabungan Aktif Anda
        </h3>
        
        <div className="bg-yellow-900/40 backdrop-blur-xl border border-yellow-500/40 px-4 py-3 rounded-xl mb-6 shadow-2xl flex gap-3 items-start">
          <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-sm text-yellow-100 leading-relaxed">
            <strong className="text-yellow-400">Penting:</strong> Kalkulasi biaya di bawah adalah estimasi. Harga final menyesuaikan dengan harga tiket, hotel, dan visa pada tahun keberangkatan.
          </p>
        </div>

        <div className="space-y-4">
          {rencanaTabunganList.map((rencanaTabungan) => {
            // Kalkulasi progress
            const totalTerkumpul = rencanaTabungan.RiwayatSetoran
              .filter(r => r.status_pembayaran === "success")
              .reduce((sum, item) => sum + Number(item.nominal), 0);
            
            const sisaTagihan = Math.max(0, Number(rencanaTabungan.total_biaya) - totalTerkumpul);
            const persentase = Math.min(100, (totalTerkumpul / Number(rencanaTabungan.total_biaya)) * 100);

            // Serialize decimals to string for Client Component
            const serializedRencana = {
              ...rencanaTabungan,
              total_biaya: rencanaTabungan.total_biaya.toString(),
              setoran_per_bulan: rencanaTabungan.setoran_per_bulan.toString(),
              paket: {
                ...rencanaTabungan.paket,
                harga_quad: rencanaTabungan.paket.harga_quad.toString(),
                harga_triple: rencanaTabungan.paket.harga_triple.toString(),
                harga_double: rencanaTabungan.paket.harga_double.toString(),
              },
              RiwayatSetoran: rencanaTabungan.RiwayatSetoran.map(r => ({
                ...r,
                nominal: r.nominal.toString()
              }))
            };

            return (
              <TabunganDashboardClient 
                key={rencanaTabungan.id}
                rencana={serializedRencana} 
                totalTerkumpul={totalTerkumpul}
                sisaTagihan={sisaTagihan}
                persentase={persentase}
              />
            );
          })}
        </div>
      </div>

      <div className="pt-8 border-t border-white/20">
        <div className="inline-block relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-emerald-900/60 to-black/40 backdrop-blur-xl border border-emerald-500/30 px-5 py-3 mb-6">
          <h3 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Cari & Tambah Rencana Tabungan Baru
          </h3>
        </div>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>
    </div>
  );
}
