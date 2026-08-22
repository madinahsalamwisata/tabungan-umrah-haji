"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import { parseFormattedText } from "@/lib/formatter";

export default function InformasiClient({ initialPengumuman }: { initialPengumuman: any[] }) {
  const [pengumumanList, setPengumumanList] = useState<any[]>(initialPengumuman);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "penting">("semua");

  useEffect(() => {
    const fetchPengumuman = () => {
      fetch("/api/admin/pengumuman")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPengumumanList(data);
          }
        })
        .catch(err => console.error("Gagal load pengumuman", err));
    };

    const interval = setInterval(fetchPengumuman, 3000);
    return () => clearInterval(interval);
  }, []);

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
    const parsedKonten = parseFormattedText(item.konten);

    Swal.fire({
      showCloseButton: true,
      showConfirmButton: false,
      background: 'transparent',
      backdrop: 'rgba(11, 61, 48, 0.5)',
      html: `
        <div class="text-left flex flex-col bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl overflow-hidden border border-emerald-100/50">
          <!-- Header Area -->
          <div class="relative bg-gradient-to-br from-emerald-50 to-emerald-100/50 px-6 sm:px-8 py-6 border-b border-emerald-100">
             <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <svg class="w-24 h-24 text-emerald-900 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>
             </div>
             <div class="relative z-10 pr-8">
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <h3 class="text-lg sm:text-xl font-extrabold text-emerald-950 leading-tight">${item.judul}</h3>
                  ${item.is_penting ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">Penting</span>' : ''}
                </div>
                <p class="text-xs text-emerald-700/70 font-medium">
                  Disiarkan pada ${formatSafeDate(item.created_at, { dateStyle: 'long' })}
                </p>
             </div>
          </div>
          
          <!-- Content Area -->
          <div class="p-6 sm:p-8">
            <div class="text-sm text-gray-700 leading-relaxed max-h-[300px] overflow-y-auto pr-3 custom-scrollbar text-justify">${parsedKonten}</div>
          </div>
          
          <!-- Footer Area -->
          <div class="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
            <button class="tutup-btn-custom inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-sm font-bold px-7 py-2 transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-95 cursor-pointer">
              Mengerti
            </button>
          </div>
        </div>
      `,
      didOpen: () => {
        const btn = Swal.getHtmlContainer()?.querySelector('.tutup-btn-custom');
        if (btn) {
          btn.addEventListener('click', () => Swal.close());
        }
      },
      customClass: {
        popup: '!bg-transparent !p-0 shadow-none',
        htmlContainer: '!m-0 !p-0',
        closeButton: '!absolute !top-4 !right-4 !z-20 !w-8 !h-8 !bg-white/50 hover:!bg-white !rounded-full !text-emerald-900 !shadow-sm transition-all focus:!outline-none'
      }
    });
  };

  const filteredList = pengumumanList.filter((item) => {
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
              {item.is_pinned && (
                <span className="absolute top-5 right-5 bg-emerald-100 text-emerald-900 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  📌 Di-pin
                </span>
              )}
              {item.is_penting && !item.is_pinned && (
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

              <h3 className="text-base font-bold mt-2.5 font-serif leading-snug flex items-center gap-1.5">
                {item.is_pinned && <span className="shrink-0 text-xs">📌</span>}
                <span>{item.judul}</span>
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
