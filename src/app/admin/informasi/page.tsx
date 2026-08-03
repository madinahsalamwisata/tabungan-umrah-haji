import { Suspense } from "react";
import AdminInformasiClient from "./AdminInformasiClient";

export const dynamic = "force-dynamic";

export default function AdminInformasiPage() {
  return (
    <div className="space-y-6">
      <div className="inline-block px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900 drop-shadow-md">Informasi Halaman</h1>
        <p className="text-sm text-emerald-800 mt-1">Kelola konten halaman Tentang Kami dan Syarat & Ketentuan calon jamaah.</p>
      </div>

      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin"></div>
        </div>
      }>
        <AdminInformasiClient />
      </Suspense>
    </div>
  );
}
