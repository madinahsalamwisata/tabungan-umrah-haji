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
  
  // Filter berdasarkan flag is_estimasi dan nama
  const estimasiPakets = futurePakets.filter(p => {
     return p.is_estimasi === true || p.nama_paket.includes("(Estimasi)");
  }).map(p => ({
     ...p,
     nama_paket: p.nama_paket.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim(),
     harga_quad: p.harga_quad.toString(),
     harga_triple: p.harga_triple.toString(),
     harga_double: p.harga_double.toString(),
  }));

  const activePaketIds = rencanaTabunganList.map(r => r.id_paket);

  if (rencanaTabunganList.length === 0) {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-emerald-100 shadow-xl">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">Belum Ada Rencana Tabungan</h2>
          <p className="text-emerald-200">Pilih estimasi paket umrah di bawah ini untuk mulai menabung.</p>
        </div>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-emerald-900 drop-shadow-md mb-4 flex items-center gap-2">
          Rencana Tabungan Aktif
        </h3>
        
        <div className="bg-amber-50 border border-amber-300 px-3 py-2.5 rounded-xl mb-5 shadow-sm flex gap-2 items-start">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong className="text-amber-700 font-bold">Penting:</strong> Kalkulasi biaya di bawah adalah estimasi. Harga final menyesuaikan dengan harga tiket, hotel, dan visa pada tahun keberangkatan.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 custom-scrollbar -mx-2 px-2 sm:-mx-0 sm:px-0">
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
                nama_paket: rencanaTabungan.paket.is_estimasi || rencanaTabungan.paket.nama_paket.includes("(Estimasi)")
                  ? rencanaTabungan.paket.nama_paket.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim()
                  : rencanaTabungan.paket.nama_paket,
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

      <div className="pt-8 border-t border-emerald-100">
        <div className="inline-block relative overflow-hidden rounded-xl shadow-md bg-emerald-950 border border-emerald-800 px-4 py-2 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Cari & Tambah Rencana Tabungan Baru
          </h3>
        </div>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>
    </div>
  );
}
