import { prisma } from "@/lib/prisma";
import AdminPaketClient from "@/components/admin/AdminPaketClient";

export const dynamic = "force-dynamic";

export default async function AdminPaketPage() {
  const paket = await prisma.paket.findMany({
    orderBy: { tanggal_keberangkatan: 'asc' }
  });

  const serialized = paket.map(p => ({
    ...p,
    harga_quad: Number(p.harga_quad),
    harga_double: Number(p.harga_double),
    harga_triple: Number(p.harga_triple),
    tanggal_keberangkatan: p.tanggal_keberangkatan.toISOString(),
    tanggal_kepulangan: p.tanggal_kepulangan.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Manajemen Paket</h1>
        <p className="text-sm text-gray-300 mt-1">Kelola daftar paket perjalanan, status keberangkatan, dan poster.</p>
      </div>

      <AdminPaketClient initialData={serialized} />
    </div>
  );
}
