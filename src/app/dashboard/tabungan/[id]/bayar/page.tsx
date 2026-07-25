import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BayarClient from "./BayarClient";

export const revalidate = 0;

export default async function TabunganBayarPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Calculate totals
  const totalTerkumpul = rencanaTabungan.RiwayatSetoran
    .filter(r => r.status_pembayaran === "success")
    .reduce((sum, item) => sum + Number(item.nominal), 0);
  
  const sisaTagihan = Math.max(0, Number(rencanaTabungan.total_biaya) - totalTerkumpul);
  const persentase = Math.min(100, (totalTerkumpul / Number(rencanaTabungan.total_biaya)) * 100);

  const serializedRencana = {
    ...rencanaTabungan,
    tanggal_mulai: rencanaTabungan.tanggal_mulai ? new Date(rencanaTabungan.tanggal_mulai).toISOString() : null,
    paket_snapshot_tanggal_berangkat: rencanaTabungan.paket_snapshot_tanggal_berangkat ? new Date(rencanaTabungan.paket_snapshot_tanggal_berangkat).toISOString() : null,
    paket_snapshot_tanggal_kepulangan: rencanaTabungan.paket_snapshot_tanggal_kepulangan ? new Date(rencanaTabungan.paket_snapshot_tanggal_kepulangan).toISOString() : null,
    total_biaya: rencanaTabungan.total_biaya.toString(),
    setoran_per_bulan: rencanaTabungan.setoran_per_bulan.toString(),
    paket: rencanaTabungan.paket ? {
      ...rencanaTabungan.paket,
      tanggal_keberangkatan: rencanaTabungan.paket.tanggal_keberangkatan ? new Date(rencanaTabungan.paket.tanggal_keberangkatan).toISOString() : null,
      tanggal_kepulangan: rencanaTabungan.paket.tanggal_kepulangan ? new Date(rencanaTabungan.paket.tanggal_kepulangan).toISOString() : null,
      harga_quad: rencanaTabungan.paket.harga_quad.toString(),
      harga_triple: rencanaTabungan.paket.harga_triple.toString(),
      harga_double: rencanaTabungan.paket.harga_double.toString(),
    } : null,
    RiwayatSetoran: rencanaTabungan.RiwayatSetoran.map(r => ({
      ...r,
      tanggal_setor: r.tanggal_setor ? new Date(r.tanggal_setor).toISOString() : null,
      nominal: r.nominal.toString()
    }))
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 drop-shadow-md">
              Halaman Pembayaran
            </h3>
            <p className="text-sm text-emerald-700">{rencanaTabungan.paket?.nama_paket || rencanaTabungan.paket_snapshot_nama || "Paket Umrah"}</p>
          </div>
        </div>
        
        <BayarClient 
          rencana={serializedRencana} 
          totalTerkumpul={totalTerkumpul}
          sisaTagihan={sisaTagihan}
          persentase={persentase}
        />
      </div>
    </div>
  );
}
