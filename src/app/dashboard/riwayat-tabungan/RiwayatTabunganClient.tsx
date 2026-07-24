"use client";

import { useRouter } from "next/navigation";

export default function RiwayatTabunganClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Riwayat Tabungan</h1>
            <p className="text-emerald-50/80 text-[11px] font-medium mt-0.5">Riwayat tabungan Umrah &amp; Haji Anda</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-hijau-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <h2 className="text-lg font-bold text-teks-900 font-serif">Riwayat Tabungan</h2>
        <p className="text-sm text-teks-500 mt-2 max-w-[250px]">
          Fitur ini sedang dalam tahap pengembangan. Kami akan segera menghadirkannya untuk Anda.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-2.5 bg-emas hover:bg-emas/90 text-hijau-900 font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
