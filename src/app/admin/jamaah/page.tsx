import { prisma } from "@/lib/prisma";
import AdminJamaahClient from "@/components/admin/AdminJamaahClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminJamaahPage() {
  // Ambil semua data jamaah beserta relasi rencana tabungannya
  const jamaahs = await prisma.jamaah.findMany({
    orderBy: { created_at: "desc" },
    include: {
      RencanaTabungan: {
        include: {
          paket: true,
          RiwayatSetoran: {
            orderBy: { tanggal_setor: "desc" }
          }
        }
      }
    }
  });

  // Karena prisma mengembalikan Decimal, kita perlu serialize (mengubah ke string/number) untuk dikirim ke Client Component
  const serializedJamaahs = jamaahs.map(j => ({
    id: j.id,
    nama: j.nama,
    email: j.email,
    no_hp: j.no_hp,
    nik: j.nik,
    alamat: j.alamat,
    foto_url: j.foto_url,
    password_plain: j.password_plain,
    created_at: j.created_at.toISOString(),
    rencana_tabungan: j.RencanaTabungan.map(rt => ({
      id: rt.id,
      paket_nama: (() => {
        const rawName = rt.paket?.nama_paket || rt.paket_snapshot_nama || "Paket Dihapus";
        const isEstimasi = rt.paket?.is_estimasi || rt.paket_snapshot_is_estimasi || rawName.includes("(Estimasi)");
        if (isEstimasi) {
          return rawName.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim();
        }
        return rawName;
      })(),
      status: rt.status,
      total_biaya: Number(rt.total_biaya),
      setoran_per_bulan: Number(rt.setoran_per_bulan),
      periode_bulan: rt.periode_bulan,
      tanggal_mulai: rt.tanggal_mulai.toISOString(),
      jenis_kamar: rt.jenis_kamar,
      jumlah_jamaah: rt.jumlah_jamaah,
      riwayat_setoran: rt.RiwayatSetoran.map(rs => ({
        id: rs.id,
        bulan_ke: rs.bulan_ke,
        tanggal_setor: rs.tanggal_setor.toISOString(),
        nominal: Number(rs.nominal),
        status_pembayaran: rs.status_pembayaran,
        id_transaksi_gateway: rs.id_transaksi_gateway
      }))
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900 drop-shadow-md">Data Jamaah</h1>
        <p className="text-sm text-emerald-800 mt-1">Kelola seluruh data jamaah dan pantau tabungan mereka.</p>
      </div>

      <Suspense fallback={<div className="text-center py-10 text-sm text-teks-500 font-bold">Loading Data Jamaah...</div>}>
        <AdminJamaahClient initialData={serializedJamaahs} />
      </Suspense>
    </div>
  );
}
