import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe } from "lucide-react";

export default async function PaketHajiPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Card */}
      <div className="bg-white border border-garis rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-hijau-100 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-hijau-800" />
        </div>
        <h2 className="text-base font-bold text-teks-900 font-serif mb-2">Katalog Paket Haji</h2>
        <p className="text-xs text-teks-500 leading-relaxed italic max-w-md">
          &quot;Semoga Allah Subhanahu Wa Ta&apos;ala memudahkan kami untuk segera menyelenggarakan program Haji dan memudahkan langkah jamaah kami untuk menunaikan ibadah Haji ke Baitullah. Amin Ya Rabbal &apos;Alamin.&quot;
        </p>
      </div>

      <div className="pt-4 space-y-6">
        {/* Placeholder for Search Engine */}
        <div className="bg-white border border-garis p-5 rounded-3xl shadow-sm opacity-60 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-teks-500 mb-2">Tipe Paket</label>
              <div className="bg-krem border border-garis rounded-xl py-2 px-3 text-xs text-teks-500">
                Semua Tipe
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-teks-500 mb-2">Keberangkatan</label>
              <div className="bg-krem border border-garis rounded-xl py-2 px-3 text-xs text-teks-500">
                Semua Bulan
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-teks-500 mb-2">Durasi (Hari)</label>
              <div className="bg-krem border border-garis rounded-xl py-2 px-3 text-xs text-teks-500">
                Semua Durasi
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white border border-garis rounded-3xl p-10 text-center shadow-sm">
          <svg className="mx-auto h-10 w-10 text-teks-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h4 className="text-sm font-bold text-teks-900">Belum ada data paket</h4>
          <p className="text-xs text-teks-500 mt-1">Saat ini belum ada data Paket Haji yang tersedia.</p>
        </div>
      </div>
    </div>
  );
}
