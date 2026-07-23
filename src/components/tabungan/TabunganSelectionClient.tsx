"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function TabunganSelectionClient() {
  const router = useRouter();

  const handleComingSoon = () => {
    Swal.fire({
      title: 'Coming Soon InsyaAllah',
      icon: 'info',
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#059669',
      width: '300px',
      customClass: {
        popup: 'rounded-3xl shadow-xl border border-gray-100 p-2',
        title: 'text-base font-bold text-gray-900 mt-2',
        confirmButton: 'text-xs font-bold px-4 py-2 rounded-xl shadow-sm'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-hijau-900 to-hijau-800 pt-8 pb-6 px-5 sticky top-0 z-20 rounded-b-[2.5rem] shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.push("/dashboard")} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors backdrop-blur-md">
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Pilih Tabungan</h1>
            <p className="text-white/80 text-xs font-medium mt-0.5">Mulai perjalanan suci Anda</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5">
        {/* Tabungan Umrah */}
        <Link href="/dashboard/tabungan/umrah" className="block relative w-full h-48 rounded-3xl overflow-hidden shadow-md group hover:shadow-lg transition-shadow active:scale-95">
          <Image 
            src="/images/bg-paket.jpeg" 
            alt="Tabungan Umrah" 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Tabungan Umrah</h2>
          </div>
        </Link>

        {/* Tabungan Haji */}
        <div onClick={handleComingSoon} className="block relative w-full h-48 rounded-3xl overflow-hidden shadow-md group hover:shadow-lg transition-shadow active:scale-95 cursor-pointer">
          <Image 
            src="/images/makkah_thumbnail.webp" 
            alt="Tabungan Haji" 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Tabungan Haji</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
