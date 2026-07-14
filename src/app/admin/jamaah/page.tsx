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
          paket: true
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
      paket_nama: rt.paket.nama_paket,
      status: rt.status,
      total_biaya: Number(rt.total_biaya)
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Data Jamaah</h1>
        <p className="text-sm text-gray-300 mt-1">Kelola seluruh data jamaah dan pantau tabungan mereka.</p>
      </div>

      <AdminJamaahClient initialData={serializedJamaahs} />
    </div>
  );
}
