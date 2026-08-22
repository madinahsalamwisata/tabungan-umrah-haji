"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { parseFormattedText } from "@/lib/formatter";

type PengumumanData = {
  id: string;
  judul: string;
  konten: string;
  is_penting: boolean;
  is_pinned: boolean;
  created_at: string;
};

export default function AdminPengumumanClient({ initialData }: { initialData: PengumumanData[] }) {
  const [data, setData] = useState<PengumumanData[]>(initialData);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "penting" | "biasa">("semua");

  // Dynamic 3-second polling for real-time updates from admin changes
  useEffect(() => {
    let active = true;
    async function fetchPengumuman() {
      try {
        const res = await fetch("/api/admin/pengumuman");
        if (res.ok) {
          const fetchedData = await res.json();
          if (active) {
            setData(fetchedData);
          }
        }
      } catch (err) {
        console.error("Gagal polling pengumuman data:", err);
      }
    }

    const interval = setInterval(fetchPengumuman, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);
  
  // Modals & detail popup state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<PengumumanData | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<PengumumanData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatting state & refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [konten, setKonten] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      setKonten(editingData?.konten || "");
    }
  }, [isModalOpen, editingData]);

  const insertFormat = (type: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let formatted = "";
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        formatted = `**${selectedText || 'teks'}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formatted = `*${selectedText || 'teks'}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'underline':
        formatted = `<u>${selectedText || 'teks'}</u>`;
        cursorOffset = selectedText ? 0 : 4;
        break;
      case 'bullet': {
        const prefix = (start > 0 && text[start - 1] !== '\n') ? '\n' : '';
        formatted = `${prefix}- ${selectedText || 'item'}`;
        cursorOffset = selectedText ? 0 : 4;
        break;
      }
      case 'number': {
        const prefix = (start > 0 && text[start - 1] !== '\n') ? '\n' : '';
        formatted = `${prefix}1. ${selectedText || 'item'}`;
        cursorOffset = selectedText ? 0 : 4;
        break;
      }
    }

    const scrollTop = textarea.scrollTop;

    const newContent = text.substring(0, start) + formatted + text.substring(end);
    setKonten(newContent);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      const newCursorPos = start + formatted.length - cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.scrollTop = scrollTop;
    }, 0);
  };

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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PengumumanData) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pengumuman?',
      text: "Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?",
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
        const res = await fetch(`/api/admin/pengumuman?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(item => item.id !== id));
          setSelectedAnnouncement(null);
          showNotification('Berhasil', 'Pengumuman berhasil dihapus!', 'success');
        } else {
          showNotification('Gagal', 'Gagal menghapus pengumuman.', 'error');
        }
      } catch (e) {
        showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: editingData?.id,
      judul: formData.get("judul") as string,
      konten: konten,
      is_penting: formData.get("is_penting") === "on",
      is_pinned: formData.get("is_pinned") === "on",
    };

    try {
      const method = editingData ? "PUT" : "POST";
      const res = await fetch("/api/admin/pengumuman", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (editingData) {
          setData(prev => prev.map(item => item.id === result.id ? result : item));
        } else {
          setData(prev => [result, ...prev]);
        }
        setIsModalOpen(false);
        showNotification('Berhasil', 'Pengumuman berhasil disebarkan!', 'success');
      } else {
        showNotification('Gagal', 'Gagal menyimpan data pengumuman.', 'error');
      }
    } catch (e) {
      showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.judul.toLowerCase().includes(search.toLowerCase()) || 
      item.konten.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === "penting") {
      return matchesSearch && item.is_penting;
    }
    if (filterType === "biasa") {
      return matchesSearch && !item.is_penting;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box matching the Header style */}
          <div className="search flex items-center gap-2 bg-krem border border-garis rounded-xl px-3.5 py-2 w-full sm:w-72">
            <svg className="w-4 h-4 stroke-teks-300 stroke-2 fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari pengumuman..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-xs w-full text-teks-900 font-sans"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-white border border-garis rounded-xl p-2 px-3 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 h-9 font-semibold"
          >
            <option value="semua">Semua Prioritas</option>
            <option value="penting">Penting</option>
            <option value="biasa">Biasa</option>
          </select>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-hijau-900 hover:bg-hijau-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg shrink-0"
        >
          <svg className="w-4 h-4 stroke-white stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Buat Pengumuman Baru
        </button>
      </div>

      {/* Clean White Table Container */}
      <div className="bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-hijau-900 to-hijau-800 text-white">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Info Informasi</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Isi Informasi</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Status</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-krem/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedAnnouncement(item)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-teks-900 text-sm max-w-[200px] truncate flex items-center gap-1.5" title={item.judul}>
                      {item.is_pinned && <span className="text-emerald-700 shrink-0">📌</span>}
                      <span className="truncate">{item.judul}</span>
                    </div>
                    <div className="text-teks-500 text-[10px] mt-0.5">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="text-teks-500 max-w-[400px] truncate" title={item.konten}>
                      {item.konten}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {item.is_pinned && (
                        <span className="status-pill inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border bg-emerald-100 text-emerald-900 border-emerald-250">
                          📌 Di-pin
                        </span>
                      )}
                      <span className={`status-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                        item.is_penting 
                          ? 'bg-gradient-to-r from-emas to-[#E4C877] text-hijau-900 border-emas/30' 
                          : 'bg-krem text-teks-500 border-garis'
                      }`}>
                        {item.is_penting ? 'Penting' : 'Biasa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 bg-hijau-100 hover:bg-hijau-200 text-hijau-900 rounded-lg transition-colors border border-garis"
                        title="Edit Pengumuman"
                      >
                        <svg className="w-4 h-4 stroke-hijau-900 stroke-2 fill-none" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-[#FBEAE8] hover:bg-[#FBEAE8]/80 text-[#B3423A] rounded-lg transition-colors border border-red-100"
                        title="Hapus Pengumuman"
                      >
                        <svg className="w-4 h-4 stroke-[#B3423A] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-teks-300 italic">
                    Tidak ada pengumuman yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- DETAIL POPUP ----------------- */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)}></div>
          
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl overflow-hidden border border-emerald-100/50 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-emerald-900 shadow-sm transition-all focus:outline-none"
            >
              <svg className="w-5 h-5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header Area */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/50 px-6 sm:px-8 py-6 border-b border-emerald-100 shrink-0 rounded-t-[28px]">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <svg className="w-24 h-24 text-emerald-900 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>
               </div>
               <div className="relative z-10 pr-8">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950 leading-tight">{selectedAnnouncement.judul}</h3>
                    {selectedAnnouncement.is_pinned && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">📌 Di-pin</span>
                    )}
                    {selectedAnnouncement.is_penting ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">Penting</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">Biasa</span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-700/70 font-medium">
                    Disiarkan pada {new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
               </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8">
              <div 
                className="text-sm text-gray-700 leading-relaxed max-h-[300px] overflow-y-auto pr-3 custom-scrollbar-dark text-justify announcement-content"
                dangerouslySetInnerHTML={{ __html: parseFormattedText(selectedAnnouncement.konten) }}
              />
            </div>

            {/* Footer Area */}
            <div className="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-2.5 shrink-0 rounded-b-[28px]">
              <button 
                type="button" 
                onClick={() => {
                  handleOpenEdit(selectedAnnouncement);
                  setSelectedAnnouncement(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 transition-colors shadow-md flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                Edit
              </button>
              <button 
                type="button" 
                onClick={() => handleDelete(selectedAnnouncement.id)} 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B3423A] bg-[#FBEAE8] hover:bg-[#FBEAE8]/80 transition-colors border border-red-100 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 stroke-[#B3423A] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CREATE/EDIT MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar-dark bg-white border border-garis rounded-[22px] shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-base font-bold text-teks-900 mb-5 border-b border-garis pb-3">
              {editingData ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Judul Pengumuman</label>
                <input 
                  name="judul" 
                  defaultValue={editingData?.judul} 
                  required 
                  className="w-full bg-krem border border-garis rounded-xl px-3 py-2.5 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" 
                  placeholder="Contoh: Pembaruan Jadwal Manasik" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Isi Pesan</label>
                
                {/* Toolbar Format */}
                <div className="flex items-center gap-1.5 bg-krem border border-garis rounded-t-xl px-2.5 py-1.5 border-b-0 select-none">
                  <button
                    type="button"
                    onClick={() => insertFormat('bold')}
                    className="p-1 hover:bg-garis/50 rounded font-bold text-xs w-6 h-6 flex items-center justify-center text-teks-900 border border-garis/40 bg-white"
                    title="Tebal (Bold)"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('italic')}
                    className="p-1 hover:bg-garis/50 rounded italic text-xs w-6 h-6 flex items-center justify-center text-teks-900 border border-garis/40 bg-white"
                    title="Miring (Italic)"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('underline')}
                    className="p-1 hover:bg-garis/50 rounded underline text-xs w-6 h-6 flex items-center justify-center text-teks-900 border border-garis/40 bg-white"
                    title="Garis Bawah (Underline)"
                  >
                    U
                  </button>
                  <div className="w-px h-3.5 bg-garis/60 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => insertFormat('bullet')}
                    className="p-1 hover:bg-garis/50 rounded text-xs w-6 h-6 flex items-center justify-center text-teks-900 font-bold border border-garis/40 bg-white"
                    title="Daftar Poin (Bullet List)"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('number')}
                    className="p-1 hover:bg-garis/50 rounded text-[10px] w-6 h-6 flex items-center justify-center text-teks-900 font-bold border border-garis/40 bg-white"
                    title="Daftar Angka (Numbered List)"
                  >
                    1.
                  </button>
                </div>

                <textarea 
                  ref={textareaRef}
                  name="konten" 
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  required 
                  rows={6} 
                  className="w-full bg-krem border border-garis rounded-b-xl px-3 py-2.5 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 resize-none border-t-0" 
                  placeholder="Tuliskan isi pengumuman lengkap di sini..."
                ></textarea>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="is_pinned" 
                    id="is_pinned" 
                    defaultChecked={editingData?.is_pinned} 
                    className="w-4 h-4 rounded border-garis text-hijau-900 focus:ring-hijau-900" 
                  />
                  <label htmlFor="is_pinned" className="text-xs font-semibold text-teks-900 cursor-pointer">Pin Informasi ini (Tampilkan paling atas)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="is_penting" 
                    id="is_penting" 
                    defaultChecked={editingData?.is_penting} 
                    className="w-4 h-4 rounded border-garis text-hijau-900 focus:ring-hijau-900" 
                  />
                  <label htmlFor="is_penting" className="text-xs font-semibold text-teks-900 cursor-pointer">Tandai sebagai Informasi Penting (Badge Emas)</label>
                </div>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 disabled:bg-hijau-900/60 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-1.5 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    editingData ? "Simpan Perubahan" : "Sebarkan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
