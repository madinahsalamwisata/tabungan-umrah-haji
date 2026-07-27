"use client";

import { useState } from "react";
import { Search, Bell, Calendar } from "lucide-react";
import Swal from "sweetalert2";

export default function InformasiClient({ initialPengumuman }: { initialPengumuman: any[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "penting">("semua");

  const formatSafeDate = (d: any, options?: Intl.DateTimeFormatOptions, fallback = "-") => {
    try {
      if (!d) return fallback;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return fallback;
      return dateObj.toLocaleDateString('id-ID', options);
    } catch {
      return fallback;
    }
  };

  const showDetail = (item: any) => {
    const cleanKonten = item.konten ? item.konten.split('\n').map((line: string) => line.trim()).join('\n') : "";

    Swal.fire({
      showCloseButton: true,
      showConfirmButton: false,
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      html: `
        <div class="text-left p-6 sm:p-7">
          <div class="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 class="text-base font-extrabold text-gray-900 leading-snug text-left" style="text-align: left;">${item.judul}</h3>
            ${item.is_penting ? '<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wide border bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500/30">Penting</span>' : ''}
          </div>
          <p class="text-[10px] text-gray-400 mt-1 text-left" style="text-align: left;">
            Disiarkan pada ${formatSafeDate(item.created_at, { dateStyle: 'long' })}
          </p>
          <div class="border-t border-gray-100 my-3"></div>
          <div class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto pr-1.5 text-justify" style="text-align: justify; text-justify: inter-word; scrollbar-width: thin;">${cleanKonten}</div>
          <div class="border-t border-gray-100 my-3.5"></div>
          <div class="flex justify-end">
            <button class="tutup-btn-custom bg-[#146349] hover:bg-[#0B3D30] text-white rounded-xl text-xs font-bold px-5 py-2.5 transition-colors shadow-md cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      `,
      didOpen: () => {
        const btn = Swal.getHtmlContainer()?.querySelector('.tutup-btn-custom');
        if (btn) {
          btn.addEventListener('click', () => {
            Swal.close();
          });
        }
      },
      customClass: {
        popup: 'rounded-[22px] border border-gray-100 shadow-2xl !p-0 text-left',
        htmlContainer: '!m-0 !p-0',
        closeButton: 'text-gray-300 hover:text-gray-900 !outline-none'
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
                {formatSafeDate(item.created_at, { dateStyle: 'medium' })}
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
