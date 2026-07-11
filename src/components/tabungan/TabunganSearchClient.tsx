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
                <div key={paket.id} className="bg-white rounded-xl shadow-md border border-emerald-100 flex flex-col">
                  <div className="bg-emerald-900 px-4 py-3 border-b-2 border-yellow-500 relative">
                    {isAlreadySelected && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">Terdaftar</span>
                    )}
                    <h4 className="font-bold text-white pr-16">{paket.nama_paket}</h4>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="text-sm">
                      <span className="text-emerald-600 font-medium block text-xs">Estimasi Keberangkatan</span>
                      {new Date(paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm">
                      <span className="text-emerald-600 font-medium block text-xs">Akomodasi (Atau Setaraf)</span>
                      Makkah: {paket.hotel_makkah} <br/>
                      Madinah: {paket.hotel_madinah}
                    </div>
                    <div className="text-sm">
                      <span className="text-emerald-600 font-medium block text-xs">Pesawat</span>
                      {paket.maskapai}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 border-t border-emerald-100">
                    {isAlreadySelected ? (
                      <button disabled className="w-full bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded shadow-sm cursor-not-allowed">
                        Sudah Dipilih (Cek Tabungan)
                      </button>
                    ) : (
                      <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}`} className="block w-full text-center bg-emerald-900 hover:bg-emerald-800 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors">
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
