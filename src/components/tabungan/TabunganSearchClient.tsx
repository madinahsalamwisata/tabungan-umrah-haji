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
              {hotelOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
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
                          <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wider font-bold">Hotel (Atau Setaraf)</p>
                          <p className="text-sm font-medium text-gray-800">Makkah: {paket.hotel_makkah || "Bintang 4/5"}</p>
                          <p className="text-sm font-medium text-gray-800">Madinah: {paket.hotel_madinah || "Bintang 4/5"}</p>
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
