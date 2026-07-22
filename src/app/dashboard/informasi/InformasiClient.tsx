"use client";

import { useState } from "react";
import { Search, Bell, Calendar } from "lucide-react";
import Swal from "sweetalert2";

export default function InformasiClient({ initialPengumuman }: { initialPengumuman: any[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "penting">("semua");

  const showDetail = (item: any) => {
    Swal.fire({
      title: item.judul,
      html: `
        <div class="text-xs text-emerald-800 mb-4 pb-3 border-b border-gray-200 text-left flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ${new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
          ${item.is_penting ? '<span class="bg-yellow-500/20 border border-yellow-500/30 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Penting</span>' : ''}
        </div>
        <div class="text-sm text-gray-700 text-left whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto" style="scrollbar-width: thin;">
          ${item.konten}
        </div>
      `,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'rounded-3xl border border-gray-200 shadow-2xl backdrop-blur-xl',
        title: 'text-left text-xl text-emerald-800 font-bold',
        htmlContainer: 'text-left !m-0 !mt-2',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-8'
      }
    });
  };

  const filteredList = initialPengumuman.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || 
                          item.konten.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "semua" ? true : item.is_penting;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Bar & Filter Header */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pengumuman atau berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-garis rounded-2xl py-3 pl-11 pr-4 text-sm text-teks-900 focus:outline-none focus:border-hijau-700 focus:ring-1 focus:ring-hijau-700 shadow-sm"
          />
          <Search className="w-5 h-5 text-teks-300 absolute left-4 top-3.5" />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 bg-garis/30 p-1.5 rounded-xl border border-garis/50">
          <button
            onClick={() => setFilterType("semua")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              filterType === "semua" 
                ? "bg-hijau-800 text-white shadow-sm" 
                : "text-teks-500 hover:bg-white/50"
            }`}
          >
            Semua Update
          </button>
          <button
            onClick={() => setFilterType("penting")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filterType === "penting" 
                ? "bg-hijau-800 text-white shadow-sm" 
                : "text-teks-500 hover:bg-white/50"
            }`}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            Penting
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3.5">
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => showDetail(item)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-md active:scale-[0.99] relative ${
                item.is_penting
                  ? "bg-hijau-900 text-white border-hijau-800"
                  : "bg-white text-teks-900 border-garis"
              }`}
            >
              {item.is_penting && (
                <span className="absolute top-5 right-5 bg-emas text-hijau-900 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Penting
                </span>
              )}
              
              <div className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                item.is_penting ? "text-white/60" : "text-teks-500"
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </div>

              <h3 className="text-base font-bold mt-2.5 font-serif leading-snug">
                {item.judul}
              </h3>

              <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                item.is_penting ? "text-white/70" : "text-teks-500"
              }`}>
                {item.konten}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-white border border-garis rounded-3xl p-8 text-center text-sm text-teks-500 shadow-sm">
            Tidak ada pengumuman yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}
