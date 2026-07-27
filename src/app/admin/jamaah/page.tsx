import { prisma } from "@/lib/prisma";
import AdminJamaahClient from "@/components/admin/AdminJamaahClient";

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
    created_at: j.created_at.toISOString(),
    rencana_tabungan: j.RencanaTabungan.map(rt => ({
      id: rt.id,
      paket_nama: rt.paket?.nama_paket || rt.paket_snapshot_nama || "Paket Dihapus",
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

      <AdminJamaahClient initialData={serializedJamaahs} />
    </div>
  );
}
