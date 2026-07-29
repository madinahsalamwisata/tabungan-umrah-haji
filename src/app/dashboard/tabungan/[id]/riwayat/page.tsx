import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RiwayatClient from "../../../riwayat/RiwayatClient";

export const revalidate = 0;

export default async function TabunganRiwayatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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

  const rencanaTabungan = await prisma.rencanaTabungan.findUnique({
    where: { id: resolvedParams.id },
    include: {
      paket: true,
      RiwayatSetoran: {
        orderBy: { tanggal_setor: 'desc' }
      }
    }
  });

  if (!rencanaTabungan || rencanaTabungan.id_jamaah !== jamaah.id) {
    redirect("/dashboard/tabungan");
  }

  // Determine back URL and estimated package status
  const isHaji = (rencanaTabungan.paket as any)?.kategori?.toLowerCase() === "haji" || 
                 rencanaTabungan.paket?.nama_paket?.toLowerCase().includes("haji") ||
                 rencanaTabungan.paket_snapshot_nama?.toLowerCase().includes("haji");
  const isEstimasi = rencanaTabungan.paket?.is_estimasi || rencanaTabungan.paket_snapshot_is_estimasi || false;
  
  const baseName = rencanaTabungan.paket?.nama_paket || rencanaTabungan.paket_snapshot_nama || "Paket Umrah";
  const namaPaketDisplay = isHaji ? baseName : (isEstimasi
    ? baseName.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim()
    : baseName);

  const backUrl = isHaji ? "/dashboard/tabungan/haji" : "/dashboard/tabungan/umrah";

  // Format data
  const riwayat = rencanaTabungan.RiwayatSetoran.map((setoran) => ({
    id: setoran.id,
    id_rencana_tabungan: setoran.id_rencana_tabungan,
    bulan_ke: setoran.bulan_ke,
    status_pembayaran: setoran.status_pembayaran,
    id_transaksi_gateway: setoran.id_transaksi_gateway,
    nominal: setoran.nominal.toString(),
    tanggal_setor: setoran.tanggal_setor ? new Date(setoran.tanggal_setor).toISOString() : null,
    nama_paket: namaPaketDisplay,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={backUrl}
            className="flex items-center gap-1.5 text-xs font-bold text-hijau-700 hover:text-hijau-900 transition-colors bg-hijau-100/50 hover:bg-hijau-100 px-3 py-2 rounded-xl"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 drop-shadow-md">
              Riwayat Transaksi
            </h3>
            <p className="text-sm text-emerald-700">{namaPaketDisplay}</p>
          </div>
        </div>
        
        <RiwayatClient riwayat={riwayat} />
      </div>
    </div>
  );
}
