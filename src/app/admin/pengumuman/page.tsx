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
      <div className="inline-block px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900 drop-shadow-md">Broadcast Pengumuman</h1>
        <p className="text-sm text-emerald-800 mt-1">Kelola dan sebar luaskan informasi kepada seluruh jamaah di dashboard mereka.</p>
      </div>

      <AdminPengumumanClient initialData={serialized} />
    </div>
  );
}
