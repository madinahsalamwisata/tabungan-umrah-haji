"use client";

import { useState } from "react";
import Swal from "sweetalert2";

type PaketData = {
  id: string;
  nama_paket: string;
  tanggal_keberangkatan: string;
  tanggal_kepulangan: string;
  hotel_makkah: string;
  hotel_madinah: string;
  maskapai: string;
  harga_quad: number;
  harga_double: number;
  harga_triple: number;
  kuota: number;
  deskripsi_fasilitas: string | null;
  poster_url: string | null;
  is_estimasi: boolean;
};

export default function AdminPaketClient({ initialData }: { initialData: PaketData[] }) {
  const [data, setData] = useState<PaketData[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<PaketData | null>(null);
  
  const [activeTab, setActiveTab] = useState<"pasti" | "estimasi">("pasti");
  const [isEstimasiForm, setIsEstimasiForm] = useState(false);

  // Helper Swal Notifications
  const showNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning') => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#146349',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-base text-hijau-900 font-bold',
        htmlContainer: 'text-xs text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2'
      }
    });
  };

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsEstimasiForm(activeTab === "estimasi");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PaketData) => {
    setEditingData(item);
    setIsEstimasiForm(item.is_estimasi);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus Paket?',
      text: `Apakah Anda yakin ingin menghapus paket "${nama}" secara permanen?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B3423A',
      cancelButtonColor: '#94A39C',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-base text-[#B3423A] font-bold',
        htmlContainer: 'text-xs text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2 text-sm',
        cancelButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2 text-sm',
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/paket?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(item => item.id !== id));
          showNotification('Berhasil', 'Paket berhasil dihapus!', 'success');
        } else {
          const err = await res.json();
          showNotification('Gagal', err.message, 'error');
        }
      } catch (e) {
        showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: editingData?.id,
      nama_paket: formData.get("nama_paket") as string,
      tanggal_keberangkatan: formData.get("tanggal_keberangkatan") as string,
      tanggal_kepulangan: formData.get("tanggal_kepulangan") as string,
      hotel_makkah: formData.get("hotel_makkah") as string,
      hotel_madinah: formData.get("hotel_madinah") as string,
      maskapai: formData.get("maskapai") as string,
      harga_quad: parseFloat(formData.get("harga_quad") as string),
      harga_double: parseFloat(formData.get("harga_double") as string),
      harga_triple: parseFloat(formData.get("harga_triple") as string),
      kuota: parseInt(formData.get("kuota") as string),
      poster_url: formData.get("poster_url") as string || null,
      is_estimasi: formData.get("is_estimasi") === "on",
    };

    // If it's estimasi, we save date as the first of selected month (e.g. YYYY-MM-01)
    if (payload.is_estimasi) {
      const monthVal = formData.get("bulan_keberangkatan") as string; // format YYYY-MM
      if (monthVal) {
        payload.tanggal_keberangkatan = `${monthVal}-01`;
        payload.tanggal_kepulangan = `${monthVal}-15`; // placeholder
      }
    }

    try {
      const method = editingData ? "PUT" : "POST";
      const res = await fetch("/api/admin/paket", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        result.tanggal_keberangkatan = new Date(result.tanggal_keberangkatan).toISOString();
        result.tanggal_kepulangan = new Date(result.tanggal_kepulangan).toISOString();
        result.harga_quad = Number(result.harga_quad);
        result.harga_double = Number(result.harga_double);
        result.harga_triple = Number(result.harga_triple);
        
        if (editingData) {
          setData(prev => prev.map(item => item.id === result.id ? result : item));
        } else {
          setData(prev => [...prev, result].sort((a,b) => new Date(a.tanggal_keberangkatan).getTime() - new Date(b.tanggal_keberangkatan).getTime()));
        }
        setIsModalOpen(false);
        showNotification('Berhasil', 'Paket berhasil disimpan!', 'success');
      } else {
        const err = await res.json();
        showNotification('Gagal', err.message, 'error');
      }
    } catch (e) {
      showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const getStarRating = (hotelStr: string) => {
    if (!hotelStr) return "";
    const match = hotelStr.match(/\*(\d)/);
    if (match) {
      const stars = parseInt(match[1]);
      return "⭐️".repeat(stars);
    }
    // Check if it says *4 or *5 without parentheses
    const match2 = hotelStr.match(/\*?\s*(\d)\s*star/i);
    if (match2) {
      return "⭐️".repeat(parseInt(match2[1]));
    }
    return "";
  };

  const getCleanHotelName = (hotelStr: string) => {
    if (!hotelStr) return "";
    return hotelStr.replace(/\(\*\d\)/g, '').replace(/\*\d/g, '').trim();
  };

  const formatMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long' });
  };

  const cleanTitle = (title: string) => {
    // Strip year like "1448H", "2026", "2027" from titles for estimation plans
    return title.replace(/\b\d{4}H?\b/gi, '').trim();
  };

  const paketPasti = data.filter(item => !item.is_estimasi);
  const paketEstimasi = data.filter(item => item.is_estimasi);

  return (
    <div className="space-y-6">
      {/* Top Action Tabs & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex p-1 bg-krem border border-garis rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('pasti')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'pasti' 
                ? 'bg-hijau-900 text-white shadow-md' 
                : 'text-teks-500 hover:text-teks-900 hover:bg-white/50'
            }`}
          >
            Paket Pasti Berangkat
          </button>
          <button 
            onClick={() => setActiveTab('estimasi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'estimasi' 
                ? 'bg-hijau-900 text-white shadow-md' 
                : 'text-teks-500 hover:text-teks-900 hover:bg-white/50'
            }`}
          >
            Rencana / Estimasi
          </button>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-hijau-900 hover:bg-hijau-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg shrink-0"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Paket
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'pasti' ? (
          <>
            {paketPasti.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-garis rounded-[22px] overflow-hidden shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col sm:flex-row group text-left"
              >
                {/* Poster Image Section */}
                <div className="sm:w-2/5 h-48 sm:h-auto relative bg-krem shrink-0">
                  <img 
                    src={item.poster_url || "/images/paket-umrah-rabiul-akhir-1448-h.jpeg"} 
                    alt={item.nama_paket} 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                  />
                </div>
                
                {/* Details Section */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-base font-bold text-teks-900 leading-snug">{item.nama_paket}</h3>
                    
                    <div className="mt-3.5 space-y-1.5 text-xs text-teks-500">
                      <p>🗓️ Keberangkatan: <span className="font-bold text-teks-900">
                        {new Date(item.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(item.tanggal_kepulangan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span></p>
                      <p>✈️ Maskapai: <span className="font-bold text-teks-900">{item.maskapai}</span></p>
                      <p>🏢 Hotel Makkah: <span className="font-bold text-teks-900">{getCleanHotelName(item.hotel_makkah)} {getStarRating(item.hotel_makkah)}</span></p>
                      <p>🏢 Hotel Madinah: <span className="font-bold text-teks-900">{getCleanHotelName(item.hotel_madinah)} {getStarRating(item.hotel_madinah)}</span></p>
                      <p>👥 Kuota Sisa: <span className="font-bold text-hijau-900">{item.kuota} Kursi</span></p>
                    </div>

                    {/* Price grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-garis/60">
                      <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                        <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Quad</div>
                        <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_quad.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                        <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Triple</div>
                        <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_triple.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                        <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Double</div>
                        <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_double.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-garis/60">
                    <button 
                      onClick={() => handleOpenEdit(item)} 
                      className="text-hijau-900 bg-hijau-100 hover:bg-hijau-200 border border-garis text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.nama_paket)} 
                      className="text-[#B3423A] bg-[#FBEAE8] hover:bg-[#FBEAE8]/80 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {paketPasti.length === 0 && (
              <div className="col-span-1 lg:col-span-2 py-12 text-center text-teks-300 italic bg-white border border-garis rounded-[22px]">
                Belum ada paket pasti yang tersedia.
              </div>
            )}
          </>
        ) : (
          <>
            {paketEstimasi.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col justify-between text-left relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <h3 className="text-base font-bold text-teks-900 leading-snug">{cleanTitle(item.nama_paket)}</h3>
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-200/50 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Estimasi</span>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-teks-500">
                    <p>🗓️ Bulan Berangkat: <span className="font-bold text-teks-900 capitalize">{formatMonth(item.tanggal_keberangkatan)}</span></p>
                    <p>✈️ Maskapai: <span className="font-bold text-teks-900">{item.maskapai}</span></p>
                    <p>🏢 Hotel Makkah: <span className="font-bold text-teks-900">{getCleanHotelName(item.hotel_makkah)} {getStarRating(item.hotel_makkah)}</span></p>
                    <p>🏢 Hotel Madinah: <span className="font-bold text-teks-900">{getCleanHotelName(item.hotel_madinah)} {getStarRating(item.hotel_madinah)}</span></p>
                  </div>

                  {/* Price grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-garis/60">
                    <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                      <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Quad</div>
                      <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_quad.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                      <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Triple</div>
                      <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_triple.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-center bg-krem p-1.5 rounded-lg border border-garis/30">
                      <div className="text-[8.5px] uppercase tracking-wider text-teks-300 font-extrabold">Double</div>
                      <div className="text-[11px] font-bold text-teks-900 mt-0.5">Rp {item.harga_double.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-garis/60">
                  <button 
                    onClick={() => handleOpenEdit(item)} 
                    className="text-hijau-900 bg-hijau-100 hover:bg-hijau-200 border border-garis text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id, item.nama_paket)} 
                    className="text-[#B3423A] bg-[#FBEAE8] hover:bg-[#FBEAE8]/80 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {paketEstimasi.length === 0 && (
              <div className="col-span-1 lg:col-span-2 py-12 text-center text-teks-300 italic bg-white border border-garis rounded-[22px]">
                Belum ada rencana paket estimasi.
              </div>
            )}
          </>
        )}
      </div>

      {/* ----------------- COMPACT EDIT/ADD MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-garis rounded-[22px] shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 custom-scrollbar text-left">
            <h2 className="text-base font-bold text-teks-900 mb-5 border-b border-garis pb-3">
              {editingData ? "Edit Paket" : "Buat Paket Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Nama Paket</label>
                  <input 
                    name="nama_paket" 
                    defaultValue={editingData?.nama_paket} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                    placeholder="Misal: Paket Umrah Spesial Rabiul Akhir" 
                  />
                </div>
                
                {isEstimasiForm ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Bulan Keberangkatan</label>
                    <input 
                      type="month" 
                      name="bulan_keberangkatan" 
                      defaultValue={editingData?.tanggal_keberangkatan ? editingData.tanggal_keberangkatan.substring(0, 7) : ""}
                      required 
                      className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Tanggal Keberangkatan</label>
                      <input 
                        type="date" 
                        name="tanggal_keberangkatan" 
                        defaultValue={editingData?.tanggal_keberangkatan ? editingData.tanggal_keberangkatan.split('T')[0] : ""} 
                        required 
                        className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Tanggal Kepulangan</label>
                      <input 
                        type="date" 
                        name="tanggal_kepulangan" 
                        defaultValue={editingData?.tanggal_kepulangan ? editingData.tanggal_kepulangan.split('T')[0] : ""} 
                        required 
                        className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Hotel Makkah & Rating</label>
                  <input 
                    name="hotel_makkah" 
                    defaultValue={editingData?.hotel_makkah} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                    placeholder="Misal: Swissotel Makkah (*5)" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Hotel Madinah & Rating</label>
                  <input 
                    name="hotel_madinah" 
                    defaultValue={editingData?.hotel_madinah} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                    placeholder="Misal: Taiba Front (*5)" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Maskapai Penerbangan</label>
                  <input 
                    name="maskapai" 
                    defaultValue={editingData?.maskapai} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                    placeholder="Misal: Saudia Airlines (Direct)" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Total Kuota (Orang)</label>
                  <input 
                    type="number" 
                    name="kuota" 
                    defaultValue={editingData?.kuota} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Harga Quad (Sekamar ber-4)</label>
                  <input 
                    type="number" 
                    name="harga_quad" 
                    defaultValue={editingData?.harga_quad} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Harga Triple (Sekamar ber-3)</label>
                  <input 
                    type="number" 
                    name="harga_triple" 
                    defaultValue={editingData?.harga_triple} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Harga Double (Sekamar ber-2)</label>
                  <input 
                    type="number" 
                    name="harga_double" 
                    defaultValue={editingData?.harga_double} 
                    required 
                    className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                  />
                </div>
                {!isEstimasiForm && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">URL Poster Gambar (Opsional)</label>
                    <input 
                      type="text" 
                      name="poster_url" 
                      defaultValue={editingData?.poster_url || ""} 
                      className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                      placeholder="Contoh: /images/poster.jpg atau link Drive" 
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-200/50 rounded-xl">
                <input 
                  type="checkbox" 
                  name="is_estimasi" 
                  id="is_estimasi" 
                  checked={isEstimasiForm}
                  onChange={(e) => setIsEstimasiForm(e.target.checked)}
                  className="w-4 h-4 rounded border-garis text-hijau-900 focus:ring-hijau-900" 
                />
                <label htmlFor="is_estimasi" className="text-xs font-semibold text-yellow-700 cursor-pointer">
                  Tandai sebagai Paket Estimasi (Harga dan Jadwal bisa berubah)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-garis">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-teks-500 bg-krem hover:bg-garis/30 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 transition-colors shadow-md"
                >
                  {editingData ? "Simpan Perubahan" : "Buat Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
