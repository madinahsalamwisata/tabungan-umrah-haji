"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/90 p-4">
      <div className="max-w-md w-full bg-[#111814] rounded-2xl shadow-2xl border border-red-500/30 p-8 text-center backdrop-blur-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-950 mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-8">
          Halaman gagal dimuat. Ini mungkin karena sesi Anda telah berakhir atau terjadi gangguan koneksi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-emerald-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
          >
            Coba Lagi (Muat Ulang)
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 bg-white/50 hover:bg-white/70 text-emerald-950 font-bold rounded-xl transition-all border border-white/70 w-full sm:w-auto"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
