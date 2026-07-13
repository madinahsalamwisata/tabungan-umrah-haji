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
      SmallSwal.fire({
        icon: 'error',
        title: 'Oops...',
        html: 'Ukuran foto maksimal 2MB',
      });
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

      <div className="relative rounded-[2rem] shadow-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Cover Area */}
        <div className="h-40 sm:h-48 relative w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-900 to-black opacity-90 z-10"></div>
          <img src="/images/bg/makkah_thumbnail.webp" alt="Cover" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 z-0" />
          
          {/* Top Right Menu */}
          <div className="absolute top-4 right-4 z-20" ref={menuRef}>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all focus:outline-none border border-white/20 shadow-lg"
              >
                <DotsVerticalIcon />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="py-1">
                    {!isEditing ? (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-white/10 transition-colors"
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
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 px-6 sm:px-10 pb-10 pt-0">
          
          {/* Avatar Section Overlapping Cover */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between relative -mt-16 sm:-mt-20 mb-8 gap-4">
            <div className="relative group shrink-0 inline-block">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#1a231f] bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center relative">
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
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
                className="absolute bottom-2 right-2 p-2 sm:p-2.5 bg-emerald-500 text-white rounded-full border-[3px] border-[#1a231f] shadow-lg hover:bg-emerald-400 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
                title="Ganti Foto"
              >
                <CameraIcon />
              </button>
            </div>
            
            <div className="mb-2 sm:mb-6 sm:text-right">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg leading-tight">{jamaah.nama}</h2>
              <p className="text-emerald-300 font-medium drop-shadow-md text-sm sm:text-base">{jamaah.email}</p>
            </div>
          </div>

          {/* Data Section */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner">
                  <label className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Email (Terkunci)</label>
                  <input
                    type="text"
                    disabled
                    value={jamaah.email}
                    className="block w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 sm:text-sm cursor-not-allowed"
                  />
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner">
                  <label htmlFor="nama" className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    type="text"
                    id="nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                  />
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner">
                  <label htmlFor="no_hp" className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    id="no_hp"
                    required
                    value={form.no_hp}
                    onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                  />
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner">
                  <label htmlFor="nik" className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">NIK</label>
                  <input
                    type="text"
                    id="nik"
                    required
                    value={form.nik}
                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                  />
                </div>

                <div className="sm:col-span-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner">
                  <label htmlFor="alamat" className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Alamat Lengkap</label>
                  <textarea
                    id="alamat"
                    rows={3}
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
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
                  className="px-5 py-2.5 border border-white/20 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center px-5 py-2.5 border border-emerald-500 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-900/50 transition-all"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nama Lengkap</p>
                </div>
                <p className="text-lg font-bold text-white pl-11">{jamaah.nama}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Alamat Email</p>
                </div>
                <p className="text-lg font-bold text-white pl-11">{jamaah.email}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">No. HP / WhatsApp</p>
                </div>
                <p className="text-lg font-bold text-white pl-11">{jamaah.no_hp}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">NIK</p>
                </div>
                <p className="text-lg font-bold text-white pl-11">{jamaah.nik}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 md:col-span-2 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Alamat Lengkap</p>
                </div>
                <p className="text-base font-semibold text-white pl-11 leading-relaxed">
                  {jamaah.alamat || <span className="text-gray-400 italic font-normal">Belum diisi</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

