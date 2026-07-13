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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/50 backdrop-blur-md border border-white/70 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm h-[38px] text-emerald-950 hover:bg-white/60 transition-colors"
      >
        <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-[#111814]/95 backdrop-blur-xl border border-white/60 shadow-xl max-h-48 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          <div
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-500/20 hover:text-emerald-700 ${value === "" ? "bg-emerald-500/20 text-emerald-700 font-semibold" : "text-gray-700"}`}
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            <span className="block truncate">{placeholder}</span>
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-500/20 hover:text-emerald-700 ${value === opt.value ? "bg-emerald-500/20 text-emerald-700 font-semibold" : "text-gray-700"}`}
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

export default function PaketSearchClient({ pakets, activePaketIds }: { pakets: any[], activePaketIds: string[] }) {
  const [tipePaket, setTipePaket] = useState("");
  const [bulanTahun, setBulanTahun] = useState("");
  const [durasi, setDurasi] = useState("");

  // Extract unique options
  const tipePaketOptions = Array.from(new Set(pakets.map(p => p.nama_paket).filter(Boolean)));
  
  const getBulanTahun = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };
  const bulanTahunOptions = Array.from(new Set(pakets.map(p => getBulanTahun(p.tanggal_keberangkatan))));
  
  const getDurasiHari = (p: any) => {
    return Math.round((new Date(p.tanggal_kepulangan).getTime() - new Date(p.tanggal_keberangkatan).getTime()) / (1000 * 60 * 60 * 24));
  };
  const durasiOptions = Array.from(new Set(pakets.map(p => `${getDurasiHari(p)} Hari`))).sort((a, b) => parseInt(a) - parseInt(b));

  const filteredPakets = pakets.filter(p => {
    const matchTipe = tipePaket === "" || p.nama_paket === tipePaket;
    const matchBulan = bulanTahun === "" || getBulanTahun(p.tanggal_keberangkatan) === bulanTahun;
    const matchDurasi = durasi === "" || `${getDurasiHari(p)} Hari` === durasi;
    return matchTipe && matchBulan && matchDurasi;
  });

  return (
    <div className="space-y-6">
      {/* Search Engine */}
      <div className="bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/70 mb-6">
        <h3 className="text-lg font-bold text-emerald-950 mb-4 flex items-center gap-2 drop-shadow-md">
          <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Cari Paket Umrah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-1">Tipe Paket</label>
            <CustomSelect 
              value={tipePaket} 
              onChange={setTipePaket} 
              options={tipePaketOptions.map((opt: any) => ({ label: opt, value: opt }))}
              placeholder="Semua Tipe Paket"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-1">Bulan & Tahun</label>
            <CustomSelect 
              value={bulanTahun} 
              onChange={setBulanTahun} 
              options={bulanTahunOptions.map((opt: any) => ({ label: opt, value: opt }))}
              placeholder="Semua Bulan & Tahun"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-1">Durasi Umrah</label>
            <CustomSelect 
              value={durasi} 
              onChange={setDurasi} 
              options={durasiOptions.map((opt: any) => ({ label: opt, value: opt }))}
              placeholder="Semua Durasi"
            />
          </div>
        </div>
      </div>

      {/* Package List */}
      <div className="space-y-6">
        {filteredPakets.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/60 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-emerald-700 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-bold text-emerald-950 drop-shadow-sm">Paket Tidak Ditemukan</h3>
            <p className="mt-1 text-sm text-gray-700">
              Coba sesuaikan kriteria pencarian Anda untuk melihat lebih banyak paket.
            </p>
          </div>
        ) : (
          filteredPakets.map((paket) => {
            const durasiHari = getDurasiHari(paket);
            const isAlreadySelected = activePaketIds.includes(paket.id);
            const depart = new Date(paket.tanggal_keberangkatan);

            // Helper to format currency and short currency
            const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
            const formatShortCurrency = (val: number) => `Rp ${(val / 1000000).toLocaleString('id-ID', {maximumFractionDigits: 1})} jt`;

            const diskon = 1000000;
            const originalQuad = Number(paket.harga_quad) + diskon;
            const originalTriple = Number(paket.harga_triple) + diskon;
            const originalDouble = Number(paket.harga_double) + diskon;

            // Split fasilitas into an array
            const fasilitasArray = paket.deskripsi_fasilitas 
              ? paket.deskripsi_fasilitas.split(',').map((f: string) => f.trim()).filter(Boolean)
              : [
                  `Hotel Makkah: ${paket.hotel_makkah || "Setaraf"}`,
                  `Hotel Madinah: ${paket.hotel_madinah || "Setaraf"}`
                ];

            return (
              <div key={paket.id} className="bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/70 overflow-hidden flex flex-col md:flex-row hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300 relative w-full group">
                
                {isAlreadySelected && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-md">
                    Terdaftar
                  </div>
                )}

                {/* Left Side: Image */}
                <div className="w-full md:w-[280px] shrink-0 relative bg-emerald-900/50 min-h-[200px] md:min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={paket.gambar || "/images/paket-umrah-rabiul-akhir-1448-h.jpeg"} 
                    alt={paket.nama_paket}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-0 left-0 bg-emerald-900 text-emerald-950 font-bold px-3 py-1 rounded-br-xl text-xs z-10 shadow-md">
                    {durasiHari} Hari
                  </div>
                  <div className="absolute top-0 right-0 bg-red-500 text-emerald-950 font-bold px-3 py-1 rounded-bl-xl text-xs z-10 flex items-center gap-1 shadow-md">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Diskon {formatCurrency(diskon)}
                  </div>
                </div>
                
                {/* Right Side: Content */}
                <div className="w-full p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-950 mb-1.5 leading-tight drop-shadow-md">
                      {paket.nama_paket} {paket.nama_paket.includes("Program") ? "" : `(Program ${durasiHari} Hari)`}
                    </h2>
                    
                    {/* Subtitle Info */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-700 text-xs mb-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {paket.maskapai || "Menyesuaikan"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {depart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {" - "}
                        {new Date(paket.tanggal_kepulangan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">Fasilitas Utama:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-700">
                        {fasilitasArray.slice(0, 4).map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mt-2 pt-5 border-t border-white/60">
                    <div className="w-full sm:w-auto">
                      <p className="text-xs text-emerald-900/70 mb-0.5 drop-shadow-sm">Mulai dari (Quad)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-700 drop-shadow-md">{formatShortCurrency(Number(paket.harga_quad))}</span>
                        <span className="text-xs text-gray-600 line-through">{formatCurrency(originalQuad)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full sm:w-auto text-xs">
                      <div className="flex flex-col gap-1 text-right text-gray-700">
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Quad:</span>
                          <span><strong className="text-emerald-950 drop-shadow-sm">{formatCurrency(Number(paket.harga_quad))}</strong> <span className="text-gray-600/80 line-through text-[10px]">{formatCurrency(originalQuad)}</span></span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Triple:</span>
                          <span><strong className="text-emerald-950 drop-shadow-sm">{formatCurrency(Number(paket.harga_triple))}</strong> <span className="text-gray-600/80 line-through text-[10px]">{formatCurrency(originalTriple)}</span></span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Double:</span>
                          <span><strong className="text-emerald-950 drop-shadow-sm">{formatCurrency(Number(paket.harga_double))}</strong> <span className="text-gray-600/80 line-through text-[10px]">{formatCurrency(originalDouble)}</span></span>
                        </div>
                      </div>

                      {(() => {
                        const oneYearFromNow = new Date();
                        // Add exactly 1 year from today's date
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                        
                        // User requirement: if it's more than 1 year away, allow tabungan
                        const isMoreThanOneYear = depart > oneYearFromNow;

                        return (
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                            {isMoreThanOneYear && !isAlreadySelected && (
                              <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}&source=paket`} className="w-full sm:w-auto bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 border border-emerald-500/40 font-bold py-2.5 px-6 text-sm rounded-full shadow-sm transition-all text-center whitespace-nowrap backdrop-blur-md">
                                Mulai Tabungan
                              </Link>
                            )}
                            <Link href={`https://madinahsalamwisata.com`} target="_blank" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold py-2.5 px-6 text-sm rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all text-center whitespace-nowrap border border-emerald-500">
                                Booking Langsung
                            </Link>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
