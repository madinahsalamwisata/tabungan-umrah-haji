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
        <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">Belum Ada Rencana Tabungan</h2>
          <p className="text-emerald-700">Pilih estimasi paket umrah di bawah ini untuk mulai menabung.</p>
        </div>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-8 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Cari & Tambah Rencana Tabungan Baru</h3>
        <TabunganSearchClient pakets={estimasiPakets} activePaketIds={activePaketIds} />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Rencana Tabungan Aktif Anda</h3>
        <div className="space-y-8">
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
    </div>
  );
}
