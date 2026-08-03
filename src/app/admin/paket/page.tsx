import { prisma } from "@/lib/prisma";
import AdminPaketClient from "@/components/admin/AdminPaketClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminPaketPage() {
  const paket = await prisma.paket.findMany({
    orderBy: { tanggal_keberangkatan: 'asc' },
    include: {
      RencanaTabungan: {
        include: {
          jamaah: true,
          RiwayatSetoran: true
        }
      }
    }
  });

  const serialized = paket.map(p => ({
    id: p.id,
    nama_paket: p.nama_paket,
    tanggal_keberangkatan: p.tanggal_keberangkatan.toISOString(),
    tanggal_kepulangan: p.tanggal_kepulangan.toISOString(),
    hotel_makkah: p.hotel_makkah,
    hotel_madinah: p.hotel_madinah,
    maskapai: p.maskapai,
    harga_quad: Number(p.harga_quad),
    harga_double: Number(p.harga_double),
    harga_triple: Number(p.harga_triple),
    kuota: p.kuota,
    deskripsi_fasilitas: p.deskripsi_fasilitas,
    poster_url: p.poster_url,
    is_estimasi: p.is_estimasi,
    peminat: p.RencanaTabungan.map(rt => {
      const totalTerkumpul = rt.RiwayatSetoran
        .filter(rs => rs.status_pembayaran === 'Lunas' || rs.status_pembayaran === 'settlement' || rs.status_pembayaran === 'success')
        .reduce((sum, rs) => sum + Number(rs.nominal), 0);

      const totalRefund = rt.RiwayatSetoran
        .filter(rs => rs.status_pembayaran === 'refund')
        .reduce((sum, rs) => sum + Math.abs(Number(rs.nominal)), 0);

      return {
        jamaah_id: rt.jamaah.id,
        nama: rt.jamaah.nama,
        email: rt.jamaah.email,
        no_hp: rt.jamaah.no_hp,
        nik: rt.jamaah.nik,
        foto_url: rt.jamaah.foto_url,
        jenis_kamar: rt.jenis_kamar,
        status_rencana: rt.status,
        setoran_terkumpul: totalTerkumpul - totalRefund,
        total_biaya: Number(rt.total_biaya)
      };
    })
  }));

  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900 drop-shadow-md">Manajemen Paket</h1>
        <p className="text-sm text-emerald-800 mt-1">Kelola daftar paket perjalanan, status keberangkatan, dan poster.</p>
      </div>

      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin"></div>
        </div>
      }>
        <AdminPaketClient initialData={serialized} />
      </Suspense>
    </div>
  );
}
