import { prisma } from "@/lib/prisma";
import AdminPengumumanClient from "@/components/admin/AdminPengumumanClient";

export const dynamic = "force-dynamic";

export default async function AdminPengumumanPage() {
  const pengumuman = await prisma.pengumuman.findMany({
    orderBy: { created_at: "desc" }
  });

  const serialized = pengumuman.map(p => ({
    ...p,
    created_at: p.created_at.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Broadcast Pengumuman</h1>
        <p className="text-sm text-gray-300 mt-1">Kelola dan sebar luaskan informasi kepada seluruh jamaah di dashboard mereka.</p>
      </div>

      <AdminPengumumanClient initialData={serialized} />
    </div>
  );
}
