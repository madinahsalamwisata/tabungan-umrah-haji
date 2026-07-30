import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BayarClient from "./BayarClient";

export const revalidate = 0;

export default async function TabunganBayarPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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

  // Calculate back URL
  const from = resolvedSearchParams.from || "beranda";
  const isHaji = rencanaTabungan.paket?.nama_paket?.toLowerCase().includes('haji') || rencanaTabungan.paket_snapshot_nama?.toLowerCase().includes('haji');
  const isEstimasi = rencanaTabungan.paket?.is_estimasi || rencanaTabungan.paket_snapshot_is_estimasi || false;
  const backUrl = from === "tabungan" 
    ? (isHaji ? "/dashboard/tabungan/haji" : "/dashboard/tabungan/umrah") 
    : "/dashboard";

  // Calculate totals
  const totalTerkumpul = rencanaTabungan.RiwayatSetoran
    .filter(r => r.status_pembayaran === "success")
    .reduce((sum, item) => sum + Number(item.nominal), 0);
  
  const sisaTagihan = Math.max(0, Number(rencanaTabungan.total_biaya) - totalTerkumpul);
  const persentase = Math.min(100, (totalTerkumpul / Number(rencanaTabungan.total_biaya)) * 100);

  const serializedRencana = {
    id: rencanaTabungan.id,
    id_jamaah: rencanaTabungan.id_jamaah,
    id_paket: rencanaTabungan.id_paket,
    jenis_kamar: rencanaTabungan.jenis_kamar,
    jumlah_jamaah: rencanaTabungan.jumlah_jamaah,
    periode_bulan: rencanaTabungan.periode_bulan,
    status: rencanaTabungan.status,
    paket_snapshot_nama: rencanaTabungan.paket_snapshot_nama,
    paket_snapshot_is_estimasi: rencanaTabungan.paket_snapshot_is_estimasi,
    paket_snapshot_maskapai: rencanaTabungan.paket_snapshot_maskapai,
    tanggal_mulai: rencanaTabungan.tanggal_mulai ? new Date(rencanaTabungan.tanggal_mulai).toISOString() : null,
    paket_snapshot_tanggal_berangkat: rencanaTabungan.paket_snapshot_tanggal_berangkat ? new Date(rencanaTabungan.paket_snapshot_tanggal_berangkat).toISOString() : null,
    paket_snapshot_tanggal_kepulangan: rencanaTabungan.paket_snapshot_tanggal_kepulangan ? new Date(rencanaTabungan.paket_snapshot_tanggal_kepulangan).toISOString() : null,
    total_biaya: rencanaTabungan.total_biaya.toString(),
    setoran_per_bulan: rencanaTabungan.setoran_per_bulan.toString(),
    paket: rencanaTabungan.paket ? {
      id: rencanaTabungan.paket.id,
      nama_paket: rencanaTabungan.paket.nama_paket,
      tanggal_keberangkatan: rencanaTabungan.paket.tanggal_keberangkatan ? new Date(rencanaTabungan.paket.tanggal_keberangkatan).toISOString() : null,
      tanggal_kepulangan: rencanaTabungan.paket.tanggal_kepulangan ? new Date(rencanaTabungan.paket.tanggal_kepulangan).toISOString() : null,
      hotel_makkah: rencanaTabungan.paket.hotel_makkah,
      hotel_madinah: rencanaTabungan.paket.hotel_madinah,
      maskapai: rencanaTabungan.paket.maskapai,
      harga_quad: rencanaTabungan.paket.harga_quad.toString(),
      harga_triple: rencanaTabungan.paket.harga_triple.toString(),
      harga_double: rencanaTabungan.paket.harga_double.toString(),
      kuota: rencanaTabungan.paket.kuota,
      deskripsi_fasilitas: rencanaTabungan.paket.deskripsi_fasilitas,
      poster_url: rencanaTabungan.paket.poster_url,
      is_estimasi: rencanaTabungan.paket.is_estimasi,
    } : null,
    RiwayatSetoran: rencanaTabungan.RiwayatSetoran.map(r => ({
      id: r.id,
      id_rencana_tabungan: r.id_rencana_tabungan,
      bulan_ke: r.bulan_ke,
      status_pembayaran: r.status_pembayaran,
      id_transaksi_gateway: r.id_transaksi_gateway,
      tanggal_setor: r.tanggal_setor ? new Date(r.tanggal_setor).toISOString() : null,
      nominal: r.nominal.toString()
    }))
  };

  // Clean year from package name if it is estimasi
  const baseName = rencanaTabungan.paket?.nama_paket || rencanaTabungan.paket_snapshot_nama || "Paket Umrah";
  const namaPaketDisplay = isHaji ? baseName : (isEstimasi
    ? baseName.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim()
    : baseName);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={backUrl} className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 drop-shadow-md">
              Halaman Pembayaran
            </h3>
            <p className="text-sm text-emerald-700">{namaPaketDisplay}</p>
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
