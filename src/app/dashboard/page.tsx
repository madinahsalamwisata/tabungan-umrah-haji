"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-900 font-medium text-lg">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <nav className="bg-emerald-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-yellow-400">
                Tabungan Umrah & Haji
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-100 text-sm hidden sm:block">
                Halo, {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-yellow-400 hover:bg-yellow-500 text-emerald-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-emerald-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white p-6 text-center">
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Selamat Datang di Dashboard!</h2>
            <p className="text-emerald-600 max-w-md mx-auto">
              Anda telah berhasil masuk ke sistem tabungan Umrah. Di sini Anda akan dapat melihat paket umrah, merencanakan tabungan, dan melihat riwayat setoran.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
