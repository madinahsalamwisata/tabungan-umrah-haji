"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const SmallSwal = Swal.mixin({
  width: '360px',
  customClass: {
    title: 'text-lg font-bold text-gray-900',
    htmlContainer: 'text-sm max-h-32 overflow-y-auto custom-scrollbar text-gray-600',
  }
});

// SVG Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
    <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const DotsVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

const UserCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-300">
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
  </svg>
);

type Jamaah = {
  id: string;
  nama: string;
  email: string;
  no_hp: string;
  nik: string;
  alamat: string | null;
  foto_url: string | null;
};

export default function ProfileForm({ jamaah }: { jamaah: Jamaah }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nama: jamaah.nama,
    no_hp: jamaah.no_hp,
    nik: jamaah.nik,
    alamat: jamaah.alamat || "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profil/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengunggah foto");

      SmallSwal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: 'Foto profil berhasil diperbarui.',
        confirmButtonColor: '#059669', // emerald-600
        confirmButtonText: 'Tutup'
      });
      router.refresh();
    } catch (err: any) {
      SmallSwal.fire({
        icon: 'error',
        title: 'Gagal',
        html: err.message || 'Terjadi kesalahan.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tutup'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil");

      SmallSwal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: 'Profil berhasil diperbarui.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Tutup'
      });
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      SmallSwal.fire({
        icon: 'error',
        title: 'Gagal',
        html: err.message || 'Terjadi kesalahan saat menyimpan.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tutup'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transition-all duration-300">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
      />

      {/* CLOSED STATE (isExpanded === false) - Black Glassmorphism Concept */}
      {!isExpanded && (
        <div className="relative rounded-[2rem] shadow-xl overflow-hidden bg-[#0f1712] border border-white/10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-cover bg-[center_65%] z-0" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}></div>
          <div className="absolute inset-0 bg-[#111814]/50 backdrop-blur-[2px] z-0"></div>
          
          {/* Top Right Buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2" ref={menuRef}>
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all focus:outline-none border border-white/10 shadow-sm"
              title="Buka Detail"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all focus:outline-none border border-white/10 shadow-sm"
              >
                <DotsVerticalIcon />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsExpanded(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      Edit Profil
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-gray-50"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Layout (Horizontal) */}
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-center mt-2">
            {/* Avatar Section (Left) */}
            <div className="shrink-0 relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-gray-900 shadow-xl overflow-hidden flex items-center justify-center relative">
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : jamaah.foto_url ? (
                  <img src={jamaah.foto_url} alt={jamaah.nama} className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full border-2 border-[#0f1712] shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                title="Ganti Foto"
              >
                <CameraIcon />
              </button>
            </div>

            {/* Data Section (Right) */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-medium text-emerald-400">Nama Lengkap</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{jamaah.nama}</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-medium text-emerald-400">Alamat Email</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{jamaah.email}</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-medium text-emerald-400">No. HP</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{jamaah.no_hp}</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-medium text-emerald-400">NIK</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{jamaah.nik}</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors shadow-sm sm:col-span-2 flex flex-col h-[70px]">
                <p className="text-[10px] uppercase tracking-wider font-medium text-emerald-400 shrink-0">Alamat Lengkap</p>
                <div className="overflow-y-auto custom-scrollbar mt-0.5 pr-1">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {jamaah.alamat || <span className="text-gray-400 italic font-normal">Belum diisi</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPENED STATE (isExpanded === true) - White Layout Concept */}
      {isExpanded && (
        <div className="relative rounded-[2rem] shadow-xl overflow-hidden bg-white border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
          {/* Header/Cover Image Area */}
          <div className="h-36 relative bg-cover bg-[center_65%]" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-0"></div>
            
            {/* Top Right Buttons */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2" ref={menuRef}>
              <button 
                onClick={() => {
                  setIsExpanded(false);
                  setIsEditing(false); // Cancel edit if closing
                }}
                className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all focus:outline-none border border-white/10 shadow-sm"
                title="Tutup Detail"
              >
                <svg className="w-5 h-5 rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all focus:outline-none border border-white/10 shadow-sm"
                >
                  <DotsVerticalIcon />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="py-1">
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          Edit Profil
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setMenuOpen(false);
                            setForm({
                              nama: jamaah.nama,
                              no_hp: jamaah.no_hp,
                              nik: jamaah.nik,
                              alamat: jamaah.alamat || "",
                            });
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Batal Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-gray-50"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Area (White Data Section) */}
          <div className="relative z-10 px-6 sm:px-8 pb-8 pt-0">
            {/* Avatar Section */}
            <div className="flex items-end relative -mt-14 mb-7">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden flex items-center justify-center relative">
                  {isUploading ? (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : jamaah.foto_url ? (
                    <img src={jamaah.foto_url} alt={jamaah.nama} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon />
                  )}
                </div>
                {/* Camera Overlay Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full border-2 border-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  title="Ganti Foto"
                >
                  <CameraIcon />
                </button>
              </div>
            </div>

            {/* Data Section */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email (Tidak bisa diubah)</label>
                    <input
                      type="text"
                      disabled
                      value={jamaah.email}
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                    <label htmlFor="nama" className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      id="nama"
                      required
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                    <label htmlFor="no_hp" className="block text-xs font-medium text-gray-700 mb-1">No. HP / WhatsApp</label>
                    <input
                      type="text"
                      id="no_hp"
                      required
                      value={form.no_hp}
                      onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                    <label htmlFor="nik" className="block text-xs font-medium text-gray-700 mb-1">NIK</label>
                    <input
                      type="text"
                      id="nik"
                      required
                      value={form.nik}
                      onChange={(e) => setForm({ ...form, nik: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                    <label htmlFor="alamat" className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                    <textarea
                      id="alamat"
                      rows={2}
                      value={form.alamat}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        nama: jamaah.nama,
                        no_hp: jamaah.no_hp,
                        nik: jamaah.nik,
                        alamat: jamaah.alamat || "",
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 shadow-sm transition-all"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 animate-in fade-in duration-300">
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:border-emerald-200 transition-colors shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{jamaah.nama}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:border-emerald-200 transition-colors shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Alamat Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{jamaah.email}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:border-emerald-200 transition-colors shadow-sm">
                  <p className="text-xs font-medium text-gray-500">No. HP / WhatsApp</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{jamaah.no_hp}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:border-emerald-200 transition-colors shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Nomor Induk Kependudukan (NIK)</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{jamaah.nik}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 sm:p-4 md:col-span-2 hover:border-emerald-200 transition-colors shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Alamat Lengkap</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-relaxed">
                    {jamaah.alamat || <span className="text-gray-400 italic">Belum diisi</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
