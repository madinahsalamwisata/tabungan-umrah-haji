"use client";

import { useState } from "react";
import Link from "next/link";

export default function TabunganSearchClient({ pakets, activePaketIds }: { pakets: any[], activePaketIds: string[] }) {
  const [pesawat, setPesawat] = useState("");
  const [hotel, setHotel] = useState("");
  const [bulan, setBulan] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Extract unique options for dropdowns
  const pesawatOptions = Array.from(new Set(pakets.map(p => p.maskapai).filter(Boolean)));
  const hotelOptions = Array.from(new Set(pakets.map(p => p.hotel_makkah).filter(Boolean)));
  const bulanOptions = Array.from(new Set(pakets.map(p => {
    return new Date(p.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  })));

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
    const pBulan = new Date(p.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const matchBulan = bulan === "" || pBulan === bulan;
    return matchPesawat && matchHotel && matchBulan;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-emerald-100">
        <h3 className="text-lg font-bold text-emerald-900 mb-4">Cari Estimasi Paket Tabungan</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pesawat</label>
            <select value={pesawat} onChange={e => setPesawat(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Semua Pesawat</option>
              {pesawatOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Hotel</label>
            <select value={hotel} onChange={e => setHotel(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Semua Hotel</option>
              {hotelOptions.map((opt: any) => <option key={opt} value={opt}>{formatHotelOption(opt)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan Keberangkatan</label>
            <select value={bulan} onChange={e => setBulan(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Semua Bulan</option>
              {bulanOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Cari Paket
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPakets.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              Tidak ada estimasi paket yang cocok dengan kriteria pencarian Anda.
            </div>
          ) : (
            filteredPakets.map(paket => {
              const isAlreadySelected = activePaketIds.includes(paket.id);

              // Helper to render stars
              const renderStars = (hotelString: string) => {
                if (!hotelString) return null;
                const match = hotelString.match(/Bintang\s+(\d)/i);
                if (match) {
                  const numStars = parseInt(match[1]);
                  const stars = Array(numStars).fill(0).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ));
                  return <span className="inline-flex items-center gap-0.5">{stars} <span className="text-gray-500 text-xs ml-1 font-normal">/Setaraf</span></span>;
                }
                return <span className="text-gray-800">{hotelString.replace(/\s*\(Atau Setaraf\)/i, "/Setaraf")}</span>;
              };

              return (
                <div key={paket.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100 overflow-hidden flex flex-col relative group">
                  {/* Decorative Top Accent */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-yellow-400"></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title Section */}
                    <div className="mb-6">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-100">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Estimasi Tabungan
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition-colors leading-snug">
                        {paket.nama_paket}
                      </h3>
                    </div>
                    
                    {/* Details Section */}
                    <div className="space-y-4 mb-6 flex-1">
                      {/* Keberangkatan */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wider font-bold">Bulan Keberangkatan</p>
                          <p className="text-sm font-semibold text-gray-900">{new Date(paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      {/* Akomodasi */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 mt-0.5 border border-yellow-100">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wider font-bold">Hotel (/Setaraf)</p>
                          <div className="text-sm font-medium text-gray-800 flex items-center gap-1">Makkah: {renderStars(paket.hotel_makkah || "Bintang 4 (Atau Setaraf)")}</div>
                          <div className="text-sm font-medium text-gray-800 flex items-center gap-1">Madinah: {renderStars(paket.hotel_madinah || "Bintang 4 (Atau Setaraf)")}</div>
                        </div>
                      </div>
                      
                      {/* Pesawat */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wider font-bold">Maskapai</p>
                          <p className="text-sm font-semibold text-gray-900">{paket.maskapai || "Menyesuaikan"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 mt-auto">
                    {isAlreadySelected ? (
                      <button disabled className="w-full bg-gray-50 text-gray-500 font-bold py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Sudah Dipilih (Tabungan)
                      </button>
                    ) : (
                      <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}`} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Pilih Estimasi Paket Ini
                      </Link>
                    )}
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
