import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TabunganDashboardClient from "@/components/tabungan/TabunganDashboardClient";

const prisma = new PrismaClient();

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

  if (rencanaTabunganList.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-emerald-900 mt-8">
        <div className="px-4 py-12 sm:px-6 flex flex-col justify-center items-center text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Rencana Tabungan</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Anda belum memiliki rencana tabungan umrah yang aktif. Mari mulai rencanakan perjalanan ibadah Anda sekarang.
          </p>
          <Link href="/dashboard/paket" className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium py-2 px-6 rounded-md shadow-sm transition-colors">
            Pilih Paket Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
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
  );
}
