import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PaketHajiPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden text-center border border-white/10 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('/images/bg/bg-paket.jpeg')" }}></div>
        <div className="absolute inset-0 bg-[#111814]/40 backdrop-blur-sm z-0"></div>
        
        <div className="relative z-10 mx-auto w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="relative z-10 text-lg md:text-xl font-semibold text-white mb-3">Katalog Paket Haji</h2>
        <p className="relative z-10 text-white/80 max-w-2xl mx-auto leading-relaxed text-sm md:text-base italic font-light">
          "Semoga Allah <i>Subhanahu Wa Ta'ala</i> memudahkan kami untuk segera menyelenggarakan program Haji dan memudahkan langkah jamaah kami untuk menunaikan ibadah Haji ke Baitullah. Amin Ya Rabbal 'Alamin."
        </p>
      </div>

      <div className="pt-4">
        {/* Placeholder for Search Engine */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Paket</label>
              <select className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 py-2 px-3">
                <option>Semua Tipe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keberangkatan</label>
              <select className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 py-2 px-3">
                <option>Semua Bulan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Hari)</label>
              <select className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 py-2 px-3">
                <option>Semua Durasi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm mt-8">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada data paket</h3>
          <p className="mt-1 text-sm text-gray-500">Saat ini belum ada data Paket Haji yang tersedia.</p>
        </div>
      </div>
    </div>
  );
}
