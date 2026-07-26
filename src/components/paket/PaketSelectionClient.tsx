"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaketSelectionClient() {
  const router = useRouter();
  const [showHajiDropdown, setShowHajiDropdown] = useState(false);
  const [isNavigatingUmrah, setIsNavigatingUmrah] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:min-h-0 md:bg-transparent md:space-y-6 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm md:relative md:top-auto md:z-0 md:bg-white md:from-transparent md:to-transparent md:border md:border-garis md:rounded-[22px] md:shadow-[0_14px_34px_-18px_rgba(11,61,48,0.15)] md:p-6 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base md:text-2xl font-bold text-white md:text-teks-900 font-display tracking-tight leading-tight">Pilih Paket</h1>
            <p className="text-emerald-50/80 md:text-teks-500 text-[11px] md:text-sm font-medium mt-0.5 md:mt-1">Lihat pilihan paket umrah dan haji yang tersedia</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 md:px-0 md:mt-8">
        {/* Paket Umrah */}
        {isNavigatingUmrah ? (
          <div className="w-full h-28 md:h-44 rounded-2xl bg-gray-200/70 animate-pulse flex flex-col items-center justify-center shadow-inner border border-gray-100">
             <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
             <p className="text-xs font-semibold text-emerald-800 animate-pulse">Loading....</p>
          </div>
        ) : (
          <Link 
            href="/dashboard/paket/umrah" 
            onClick={() => setIsNavigatingUmrah(true)}
            className="block relative w-full h-28 md:h-44 rounded-2xl overflow-hidden shadow-[0_4px_12px_-4px_rgba(6,78,59,0.2)] group active:scale-[0.98] transition-all hover:scale-[1.01] hover:shadow-lg"
          >
            <Image 
              src="/images/bg-paket.jpeg" 
              alt="Paket Umrah" 
              fill 
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/70 to-transparent"></div>
            <div className="absolute inset-0 px-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-sm">Paket Umrah</h2>
                <p className="text-[11px] md:text-xs text-emerald-50/90 mt-0.5 font-medium">Jadwal keberangkatan pasti</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <svg className="w-4 h-4 text-white ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {/* Paket Haji */}
        <div>
          <div 
            onClick={() => setShowHajiDropdown(!showHajiDropdown)} 
            className="block relative w-full h-28 md:h-44 rounded-2xl overflow-hidden shadow-[0_4px_12px_-4px_rgba(6,78,59,0.2)] group active:scale-[0.98] transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer"
          >
            <Image 
              src="/images/makkah_thumbnail.webp" 
              alt="Paket Haji" 
              fill 
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/70 to-transparent"></div>
            <div className="absolute inset-0 px-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-sm">Paket Haji</h2>
                <p className="text-[11px] md:text-xs text-emerald-50/90 mt-0.5 font-medium">Pilihan paket haji terbaik</p>
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
