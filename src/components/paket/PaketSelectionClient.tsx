"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaketSelectionClient() {
  const router = useRouter();
  const [showHajiDropdown, setShowHajiDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-hijau-900 to-hijau-800 pt-8 pb-6 px-5 sticky top-0 z-20 rounded-b-[2.5rem] shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.push("/dashboard")} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors backdrop-blur-md">
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white tracking-tight">Pilih Paket</h1>
            <p className="text-white/80 text-xs font-medium mt-0.5">Lihat pilihan paket yang tersedia</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {/* Paket Umrah */}
        <Link href="/dashboard/paket/umrah" className="block relative w-full h-32 rounded-[1.5rem] overflow-hidden shadow-sm group hover:shadow-md transition-all active:scale-[0.98]">
          <Image 
            src="/images/bg-paket.jpeg" 
            alt="Paket Umrah" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">Paket Umrah</h2>
              <p className="text-xs text-white/80 mt-0.5 font-medium">Jadwal keberangkatan pasti</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Paket Haji */}
        <div>
          <div 
            onClick={() => setShowHajiDropdown(!showHajiDropdown)} 
            className="block relative w-full h-32 rounded-[1.5rem] overflow-hidden shadow-sm group hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Image 
              src="/images/makkah_thumbnail.webp" 
              alt="Paket Haji" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 p-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">Paket Haji</h2>
                <p className="text-xs text-white/80 mt-0.5 font-medium">Pilihan paket haji terbaik</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform duration-300" style={{ transform: showHajiDropdown ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Dropdown Notification */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showHajiDropdown ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center justify-center shadow-sm">
              <p className="text-sm font-semibold text-emerald-800">✨ Coming Soon InsyaAllah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
