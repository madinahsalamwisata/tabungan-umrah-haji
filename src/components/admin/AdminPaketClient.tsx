"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

type PeminatItem = {
  jamaah_id: string;
  nama: string;
  email: string;
  no_hp: string;
  nik: string;
  foto_url: string | null;
  jenis_kamar: string;
  status_rencana: string;
  setoran_terkumpul: number;
  total_biaya: number;
};

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
  peminat: PeminatItem[];
};

export default function AdminPaketClient({ initialData }: { initialData: PaketData[] }) {
  const [data, setData] = useState<PaketData[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<PaketData | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic 3-second polling for real-time updates
  useEffect(() => {
    let active = true;
    async function fetchPakets() {
      try {
        const res = await fetch("/api/admin/paket");
        if (res.ok) {
          const fetchedData = await res.json();
          if (active) {
            setData(fetchedData);
          }
        }
      } catch (err) {
        console.error("Gagal polling paket data:", err);
      }
    }

    const interval = setInterval(fetchPakets, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Read initial states from URL query parameters
  const urlTab = searchParams.get("tab") as "pasti" | "estimasi" | "pilihan" | null;
  const urlPaketId = searchParams.get("paketId");
  const urlSearch = searchParams.get("search") || "";
  const urlFilter = searchParams.get("filter") as 'all' | 'aktif' | 'selesai' | 'dibatalkan' | null;

  const [activeTab, setActiveTab] = useState<"pasti" | "estimasi" | "pilihan">(urlTab || "pasti");
  const [selectedPilihanPaketId, setSelectedPilihanPaketId] = useState<string | null>(urlPaketId);
  const [peminatSearch, setPeminatSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'selesai' | 'dibatalkan'>(urlFilter || 'all');
  const [isEstimasiForm, setIsEstimasiForm] = useState(false);

  // Sync state variables with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (selectedPilihanPaketId) {
      params.set("paketId", selectedPilihanPaketId);
    }
    if (peminatSearch) {
      params.set("search", peminatSearch);
    }
    if (statusFilter !== 'all') {
      params.set("filter", statusFilter);
    }
    router.replace(`/admin/paket?${params.toString()}`, { scroll: false });
  }, [activeTab, selectedPilihanPaketId, peminatSearch, statusFilter, router]);

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

  const cleanTitle = (title: string, isEstimasi?: boolean) => {
    if (isEstimasi || title.toLowerCase().includes('estimasi')) {
      return title.replace(/\s*\d{4}\s*H?\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    }
    return title;
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
            onClick={() => {
              setActiveTab('pasti');
              setSelectedPilihanPaketId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'pasti' 
                ? 'bg-hijau-900 text-white shadow-md' 
                : 'text-teks-500 hover:text-teks-900 hover:bg-white/50'
            }`}
          >
            Paket Pasti Berangkat
          </button>
          <button 
            onClick={() => {
              setActiveTab('estimasi');
              setSelectedPilihanPaketId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'estimasi' 
                ? 'bg-hijau-900 text-white shadow-md' 
                : 'text-teks-500 hover:text-teks-900 hover:bg-white/50'
            }`}
          >
            Rencana / Estimasi
          </button>
          <button 
            onClick={() => {
              setActiveTab('pilihan');
              setSelectedPilihanPaketId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'pilihan' 
                ? 'bg-hijau-900 text-white shadow-md' 
                : 'text-teks-500 hover:text-teks-900 hover:bg-white/50'
            }`}
          >
            Paket Pilihan Jamaah
          </button>
        </div>

        {activeTab !== 'pilihan' && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-hijau-900 hover:bg-hijau-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg shrink-0"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Paket
          </button>
        )}
      </div>

      {/* Main Flex Column Content */}
      <div className="flex flex-col gap-6">
        {activeTab === 'pasti' && (
          <>
            {paketPasti.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-garis rounded-[22px] overflow-hidden shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col sm:flex-row sm:h-[300px] group text-left"
              >
                {/* Poster Image Section */}
                <div className="sm:w-[260px] h-48 sm:h-full relative bg-krem shrink-0">
                  <img 
                    src={item.poster_url || "/images/paket-umrah-rabiul-akhir-1448-h.jpeg"} 
                    alt={item.nama_paket} 
                    className="w-full h-full object-cover object-top transition-opacity duration-300" 
                  />
                </div>
                
                {/* Details Section */}
                <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
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
        )}

        {activeTab === 'estimasi' && (
          <>
            {paketEstimasi.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col justify-between text-left relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <h3 className="text-base font-bold text-teks-900 leading-snug">{cleanTitle(item.nama_paket, item.is_estimasi)}</h3>
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

        {activeTab === 'pilihan' && (
          <div className="space-y-6">
            {selectedPilihanPaketId ? (
              // Detail View for a package's pilgrims selection
              (() => {
                const selectedPaket = data.find(p => p.id === selectedPilihanPaketId);
                if (!selectedPaket) return null;
                
                const countAktif = selectedPaket.peminat.filter(p => {
                  const isDibatalkan = p.status_rencana === "Dibatalkan";
                  const isSelesai = p.status_rencana === "Selesai" || p.status_rencana === "Lunas" || p.setoran_terkumpul >= p.total_biaya;
                  return !isDibatalkan && !isSelesai;
                }).length;

                const countDibatalkan = selectedPaket.peminat.filter(p => p.status_rencana === "Dibatalkan").length;

                const countSelesai = selectedPaket.peminat.filter(p => {
                  const isDibatalkan = p.status_rencana === "Dibatalkan";
                  const isSelesai = p.status_rencana === "Selesai" || p.status_rencana === "Lunas" || p.setoran_terkumpul >= p.total_biaya;
                  return !isDibatalkan && isSelesai;
                }).length;

                const filteredPeminat = selectedPaket.peminat.filter(pm => {
                  const matchesSearch = pm.nama.toLowerCase().includes(peminatSearch.toLowerCase()) ||
                    pm.email.toLowerCase().includes(peminatSearch.toLowerCase()) ||
                    pm.nik.includes(peminatSearch) ||
                    pm.no_hp.includes(peminatSearch);

                  if (!matchesSearch) return false;

                  const isDibatalkan = pm.status_rencana === "Dibatalkan";
                  const isSelesai = pm.status_rencana === "Selesai" || pm.status_rencana === "Lunas" || pm.setoran_terkumpul >= pm.total_biaya;
                  const isAktif = !isDibatalkan && !isSelesai;

                  if (statusFilter === 'aktif') return isAktif;
                  if (statusFilter === 'selesai') return isSelesai;
                  if (statusFilter === 'dibatalkan') return isDibatalkan;
                  return true;
                });

                return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header Action Row */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedPilihanPaketId(null)}
                        className="flex items-center gap-1.5 text-xs font-bold text-hijau-700 hover:text-hijau-900 transition-colors bg-hijau-100/50 hover:bg-hijau-100 px-3 py-2 rounded-xl"
                      >
                        <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Daftar Paket
                      </button>
                    </div>

                    {/* Package Info card */}
                    <div className="p-6 bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-hijau-100 text-hijau-800 tracking-wider">
                          Pilihan Paket
                        </span>
                        <h2 className="text-lg font-bold text-teks-900 mt-2">{cleanTitle(selectedPaket.nama_paket, selectedPaket.is_estimasi)}</h2>
                        <p className="text-xs text-teks-500 mt-1">
                          🗓️ {selectedPaket.is_estimasi ? "Estimasi Keberangkatan:" : "Keberangkatan:"} <span className="font-bold text-teks-900">
                            {selectedPaket.is_estimasi 
                              ? formatMonth(selectedPaket.tanggal_keberangkatan)
                              : new Date(selectedPaket.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            }
                          </span> | ✈️ Maskapai: <span className="font-bold text-teks-900">{selectedPaket.maskapai}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                        <div className="bg-white border border-garis px-4 py-3 rounded-2xl text-center flex flex-col justify-center min-w-[100px]">
                          <div className="text-[9px] uppercase font-extrabold text-teks-500 tracking-wide">Total Peminat</div>
                          <div className="text-base font-black text-teks-900 mt-0.5">{selectedPaket.peminat.length} Calon Jamaah</div>
                        </div>
                        <div className="bg-krem border border-garis/80 px-4 py-3 rounded-2xl text-left flex flex-col gap-1 text-[10px] font-bold min-w-[150px]">
                          <div className="text-[9px] uppercase font-extrabold text-teks-500 tracking-wide mb-1 border-b border-garis/50 pb-1">Kategori Status</div>
                          <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-1 font-semibold">🟢 Paket Aktif:</span>
                            <span className="text-hijau-800 font-extrabold">{countAktif} Jamaah</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-1 font-semibold">🔵 Paket Selesai:</span>
                            <span className="text-blue-800 font-extrabold">{countSelesai} Jamaah</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-1 font-semibold">🔴 Paket Dibatalkan:</span>
                            <span className="text-red-800 font-extrabold">{countDibatalkan} Jamaah</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search bar & Filter */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Search bar */}
                        <div className="flex items-center gap-2 bg-krem border border-garis rounded-xl px-3.5 py-2 w-full sm:w-80">
                          <svg className="w-4 h-4 stroke-teks-300 stroke-2 fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                          <input 
                            type="text" 
                            placeholder="Cari nama, email, NIK, HP..." 
                            value={peminatSearch}
                            onChange={(e) => setPeminatSearch(e.target.value)}
                            className="border-none bg-transparent outline-none text-xs w-full text-teks-900 font-sans"
                          />
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex p-1 bg-krem border border-garis rounded-xl w-fit shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                              statusFilter === 'all'
                                ? 'bg-white text-teks-900 shadow-sm border border-garis/30'
                                : 'text-teks-500 hover:text-teks-900'
                            }`}
                          >
                            Semua ({selectedPaket.peminat.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('aktif')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                              statusFilter === 'aktif'
                                ? 'bg-hijau-900 text-white shadow-sm'
                                : 'text-teks-500 hover:text-teks-900'
                            }`}
                          >
                            🟢 Aktif ({countAktif})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('selesai')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                              statusFilter === 'selesai'
                                ? 'bg-blue-900 text-white shadow-sm'
                                : 'text-teks-500 hover:text-teks-900'
                            }`}
                          >
                            🔵 Selesai ({countSelesai})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('dibatalkan')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                              statusFilter === 'dibatalkan'
                                ? 'bg-red-900 text-white shadow-sm'
                                : 'text-teks-500 hover:text-teks-900'
                            }`}
                          >
                            🔴 Dibatalkan ({countDibatalkan})
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] overflow-hidden">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gradient-to-r from-hijau-900 to-hijau-800 text-white">
                              <tr>
                                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Calon Jamaah</th>
                                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Kontak & NIK</th>
                                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Pilihan Kamar</th>
                                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Status Rencana</th>
                                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase text-right">Tabungan Terkumpul</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-garis">
                              {filteredPeminat.map((pm, idx) => (
                                <tr key={idx} className="hover:bg-krem/40 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      {pm.foto_url ? (
                                        <img 
                                          src={pm.foto_url} 
                                          alt={pm.nama} 
                                          className="w-[34px] h-[34px] rounded-full object-cover shrink-0 border border-garis"
                                        />
                                      ) : (
                                        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-white text-[12px] bg-gradient-to-br from-hijau-700 to-hijau-900 shrink-0">
                                          {pm.nama?.[0] || "J"}
                                        </div>
                                      )}
                                      <div className="text-left">
                                        <div className="font-bold text-teks-900 text-sm">{pm.nama}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-left">
                                    <div className="font-semibold text-teks-900">{pm.email}</div>
                                    <div className="text-teks-500 text-[10px] mt-0.5">{pm.no_hp} • NIK: {pm.nik}</div>
                                  </td>
                                  <td className="px-6 py-4 text-left capitalize font-bold text-teks-900">
                                    {pm.jenis_kamar}
                                  </td>
                                  <td className="px-6 py-4 text-left">
                                    {(() => {
                                      const isDibatalkan = pm.status_rencana === "Dibatalkan";
                                      const isSelesai = pm.status_rencana === "Selesai" || pm.status_rencana === "Lunas" || pm.setoran_terkumpul >= pm.total_biaya;
                                      
                                      if (isDibatalkan) {
                                        return (
                                          <span className="text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded border bg-red-50 text-red-600 border-red-100/50">
                                            Dibatalkan
                                          </span>
                                        );
                                      } else if (isSelesai) {
                                        return (
                                          <span className="text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded border bg-blue-50 text-blue-600 border-blue-100/50">
                                            Selesai
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded border bg-hijau-100 text-hijau-800 border-hijau-200/50">
                                            Aktif
                                          </span>
                                        );
                                      }
                                    })()}
                                  </td>
                                  <td className="px-6 py-4 text-right font-extrabold text-sm text-hijau-900">
                                    Rp {pm.setoran_terkumpul.toLocaleString('id-ID')}
                                    <span className="text-[10px] text-teks-300 font-medium block mt-0.5">
                                      dari Rp {pm.total_biaya.toLocaleString('id-ID')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {filteredPeminat.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-teks-300 italic">
                                    Tidak ada calon jamaah yang cocok dengan pencarian.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // List View of Packages containing choices
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {(() => {
                  const chosenPackages = data.filter(item => item.peminat.length > 0);
                  
                  return (
                    <>
                      {chosenPackages.map((item) => {
                        const countAktif = item.peminat.filter(p => {
                          const isDibatalkan = p.status_rencana === "Dibatalkan";
                          const isSelesai = p.status_rencana === "Selesai" || p.status_rencana === "Lunas" || p.setoran_terkumpul >= p.total_biaya;
                          return !isDibatalkan && !isSelesai;
                        }).length;

                        const countDibatalkan = item.peminat.filter(p => p.status_rencana === "Dibatalkan").length;

                        const countSelesai = item.peminat.filter(p => {
                          const isDibatalkan = p.status_rencana === "Dibatalkan";
                          const isSelesai = p.status_rencana === "Selesai" || p.status_rencana === "Lunas" || p.setoran_terkumpul >= p.total_biaya;
                          return !isDibatalkan && isSelesai;
                        }).length;

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => {
                              setSelectedPilihanPaketId(item.id);
                              setPeminatSearch("");
                              setStatusFilter("all");
                            }}
                            className="bg-white border border-garis rounded-[22px] p-5 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] text-left flex flex-col justify-between transition-all duration-300 cursor-pointer hover:border-hijau-800 hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2.5 gap-2">
                                <h3 className="text-sm font-bold text-teks-900 leading-snug">{cleanTitle(item.nama_paket, item.is_estimasi)}</h3>
                                {item.is_estimasi && (
                                  <span className="bg-yellow-50 text-yellow-700 border border-yellow-200/50 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Estimasi</span>
                                )}
                              </div>

                              <div className="mt-3.5 space-y-1.5 text-[11px] text-teks-500">
                                <p>🗓️ {item.is_estimasi ? "Estimasi Keberangkatan:" : "Keberangkatan:"} <span className="font-bold text-teks-900">
                                  {item.is_estimasi 
                                    ? formatMonth(item.tanggal_keberangkatan)
                                    : new Date(item.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                  }
                                </span></p>
                                <p>✈️ Maskapai: <span className="font-bold text-teks-900">{item.maskapai}</span></p>
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-garis/60 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-teks-400 flex items-center gap-1">🟢 Paket Aktif:</span>
                                <span className="font-black text-hijau-800 bg-hijau-100 px-2 py-0.5 rounded-lg border border-hijau-200/30">
                                  {countAktif} Calon Jamaah
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-teks-400 flex items-center gap-1">🔵 Paket Selesai:</span>
                                <span className="font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200/30">
                                  {countSelesai} Calon Jamaah
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-teks-400 flex items-center gap-1">🔴 Paket Dibatalkan:</span>
                                <span className="font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-lg border border-red-200/30">
                                  {countDibatalkan} Calon Jamaah
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {chosenPackages.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-teks-400 font-medium bg-white border border-garis rounded-[22px]">
                          Belum ada paket yang dipilih oleh calon jamaah.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- COMPACT EDIT/ADD MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-garis rounded-[22px] shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200 custom-scrollbar text-left flex flex-col">
            <div className="flex justify-between items-center border-b border-garis pb-3 mb-4 shrink-0">
              <h2 className="text-sm font-extrabold text-teks-900 uppercase tracking-wider">
                {editingData ? "Edit Paket Perjalanan" : "Buat Paket Baru"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-teks-300 hover:text-teks-900 p-1"
              >
                <svg className="w-5 h-5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
              
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
