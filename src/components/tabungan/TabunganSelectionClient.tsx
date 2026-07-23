"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TabunganSelectionClient() {
  const router = useRouter();
  const [showHajiDropdown, setShowHajiDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Pilih Tabungan</h1>
            <p className="text-emerald-50/80 text-[11px] font-medium mt-0.5">Mulai perjalanan suci Anda</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5">
        {/* Tabungan Umrah */}
        <Link href="/dashboard/tabungan/umrah" className="block relative w-full h-28 rounded-2xl overflow-hidden shadow-[0_4px_12px_-4px_rgba(6,78,59,0.2)] group active:scale-[0.98] transition-transform">
          <Image 
            src="/images/bg-paket.jpeg" 
            alt="Tabungan Umrah" 
            fill 
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/70 to-transparent"></div>
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">Tabungan Umrah</h2>
              <p className="text-[11px] text-emerald-50/90 mt-0.5 font-medium">Lihat rencana & mulai menabung</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <svg className="w-4 h-4 text-white ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Tabungan Haji */}
        <div>
          <div 
            onClick={() => setShowHajiDropdown(!showHajiDropdown)} 
            className="block relative w-full h-28 rounded-2xl overflow-hidden shadow-[0_4px_12px_-4px_rgba(6,78,59,0.2)] group active:scale-[0.98] transition-transform cursor-pointer"
          >
            <Image 
              src="/images/makkah_thumbnail.webp" 
              alt="Tabungan Haji" 
              fill 
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/70 to-transparent"></div>
            <div className="absolute inset-0 px-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">Tabungan Haji</h2>
                <p className="text-[11px] text-emerald-50/90 mt-0.5 font-medium">Persiapkan tabungan haji</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner transition-transform duration-300" style={{ transform: showHajiDropdown ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg className="w-4 h-4 text-white ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Dropdown Notification */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showHajiDropdown ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="bg-emerald-50 border border-emerald-100/60 rounded-xl px-4 py-3 flex items-center gap-3 shadow-inner">
               <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
              <p className="text-xs font-semibold text-emerald-800">Coming Soon InsyaAllah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
