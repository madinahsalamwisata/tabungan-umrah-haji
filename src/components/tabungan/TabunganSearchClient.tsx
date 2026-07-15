"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: { label: string, value: string }[], 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-50' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-emerald-950 border border-emerald-800 rounded-xl shadow-sm pl-4 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm h-[42px] text-white transition-colors hover:bg-emerald-900"
      >
        <span className="block truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-emerald-950/95 backdrop-blur-xl border border-emerald-800 shadow-xl max-h-48 rounded-xl py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          <div
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-500/20 hover:text-emerald-300 ${value === "" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-gray-300"}`}
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            <span className="block truncate">{placeholder}</span>
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-500/20 hover:text-emerald-300 ${value === opt.value ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-gray-300"}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              <span className="block truncate">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TabunganSearchClient({ pakets, activePaketIds }: { pakets: any[], activePaketIds: string[] }) {
  const [pesawat, setPesawat] = useState("");
  const [hotel, setHotel] = useState("");
  const [bulan, setBulan] = useState("");
  const [hasSearched, setHasSearched] = useState(true);

  // Extract unique options for dropdowns
  const pesawatOptions = Array.from(new Set(pakets.map(p => p.maskapai).filter(Boolean)));
  const hotelOptions = Array.from(new Set(pakets.map(p => p.hotel_makkah).filter(Boolean)));
  const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const formatHotelOption = (hotelString: string) => {
    const match = hotelString.match(/Bintang\s+(\d)/i);
    if (match) {
      const numStars = parseInt(match[1]);
      const stars = "⭐".repeat(numStars);
      return `${stars} /Setaraf`;
    }
    return hotelString.replace(/\s*\(Atau Setaraf\)/i, " /Setaraf");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const filteredPakets = pakets.filter(p => {
    const matchPesawat = pesawat === "" || p.maskapai === pesawat;
    const matchHotel = hotel === "" || p.hotel_makkah === hotel;
    const pBulan = new Date(p.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long' });
    const matchBulan = bulan === "" || pBulan === bulan;
    return matchPesawat && matchHotel && matchBulan;
  });

  return (
    <div className="space-y-6">
      <div className="relative z-30 p-6 rounded-[2rem] shadow-xl border border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-emerald-900 mb-4">Cari Estimasi Paket Tabungan</h3>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-1">Jenis Pesawat</label>
              <CustomSelect 
                value={pesawat} 
                onChange={setPesawat} 
                options={pesawatOptions.map((opt: any) => ({ label: opt, value: opt }))}
                placeholder="Semua Pesawat"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-1">Jenis Hotel</label>
              <CustomSelect 
                value={hotel} 
                onChange={setHotel} 
                options={hotelOptions.map((opt: any) => ({ label: formatHotelOption(opt), value: opt }))}
                placeholder="Semua Hotel"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-1">Bulan Keberangkatan</label>
              <CustomSelect 
                value={bulan} 
                onChange={setBulan} 
                options={bulanOptions.map((opt: any) => ({ label: opt, value: opt }))}
                placeholder="Semua Bulan"
              />
            </div>
            <div>
              <button type="submit" className="w-full h-[42px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all border border-emerald-500/50">
                Cari Paket
              </button>
            </div>
          </form>
        </div>
      </div>

      {hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPakets.filter(p => !activePaketIds.includes(p.id)).length === 0 ? (
            <div className="col-span-full p-8 text-center text-emerald-900 font-medium bg-white/90 rounded-2xl border border-emerald-100 backdrop-blur-md shadow-sm">
              Tidak ada estimasi paket yang tersedia untuk dipilih berdasarkan kriteria pencarian Anda. (Mungkin paket sudah Anda pilih sebelumnya).
            </div>
          ) : (
            filteredPakets
              .filter(p => !activePaketIds.includes(p.id))
              .map(paket => {
              // Helper to render stars
              const renderStars = (hotelString: string) => {
                if (!hotelString) return null;
                const match = hotelString.match(/Bintang\s+(\d)/i);
                if (match) {
                  const numStars = parseInt(match[1]);
                  const stars = Array(numStars).fill(0).map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ));
                  return <span className="inline-flex items-center gap-0.5">{stars} <span className="text-emerald-900/70 text-[10px] ml-1 font-normal">/Setaraf</span></span>;
                }
                return <span className="text-emerald-900/70 text-xs">{hotelString.replace(/\s*\(Atau Setaraf\)/i, "/Setaraf")}</span>;
              };

              return (
                <div 
                  key={paket.id} 
                  className="relative rounded-[2rem] shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border border-emerald-100 bg-white/90 backdrop-blur-md overflow-hidden group flex flex-col h-full hover:border-emerald-300"
                >
                  
                  <div className="relative z-10 p-5 flex flex-col h-full">
                    {/* Title Section */}
                    <div className="mb-4">
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold mb-3 border border-emerald-200">
                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Estimasi Tabungan
                      </div>
                      <h3 className="text-base font-bold text-emerald-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        {paket.nama_paket}
                      </h3>
                    </div>
                    
                    {/* Details Section */}
                    <div className="flex-1 space-y-3.5 mb-6">
                      {/* Keberangkatan */}
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-700/80 uppercase tracking-wider font-bold">Bulan Keberangkatan</p>
                          <p className="text-sm font-semibold text-emerald-900">{new Date(paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long' })}</p>
                        </div>
                      </div>
                      
                      {/* Akomodasi */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/30 mt-0.5">
                          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-700/80 uppercase tracking-wider font-bold mb-0.5">Hotel (/Setaraf)</p>
                          <div className="text-xs font-medium text-emerald-900 flex items-center gap-1 mb-1">Makkah: {renderStars(paket.hotel_makkah || "Bintang 4")}</div>
                          <div className="text-xs font-medium text-emerald-900 flex items-center gap-1">Madinah: {renderStars(paket.hotel_madinah || "Bintang 4")}</div>
                        </div>
                      </div>
                      
                      {/* Pesawat */}
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-700/80 uppercase tracking-wider font-bold">Maskapai</p>
                          <p className="text-sm font-semibold text-emerald-900">{paket.maskapai || "Menyesuaikan"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right content (Button) */}
                    <div className="mt-auto pt-4 border-t border-emerald-100">
                      <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}`} className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm border border-emerald-800">
                        + Pilih Paket Ini
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
