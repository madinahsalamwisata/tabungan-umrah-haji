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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-700">
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

export default function ProfileForm({ jamaah, children }: { jamaah: Jamaah, children?: React.ReactNode }) {
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
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-all duration-300">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
        />

        {/* KOLOM KIRI: ID Card Profile (Lebih ringkas dan inovatif) */}
        <div className="lg:col-span-4">
          <div className="h-full relative rounded-3xl shadow-xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center">
          {/* Subtle Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-transparent to-teal-900/40 opacity-80 z-0"></div>
          
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-emerald-500/40 bg-white/80 backdrop-blur-md shadow-lg overflow-hidden flex items-center justify-center relative">
                {isUploading ? (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
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
                className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-emerald-950 rounded-full border-2 border-[#1a231f] shadow-md hover:bg-emerald-500 hover:scale-110 transition-all disabled:opacity-50"
                title="Ganti Foto"
              >
                <CameraIcon />
              </button>
            </div>

            {/* User Info */}
            <h2 className="text-xl font-bold text-emerald-950 drop-shadow-md leading-tight mb-1">{jamaah.nama}</h2>
            <p className="text-emerald-700 font-medium text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{jamaah.email}</p>

            {/* Action Buttons */}
            <div className="w-full mt-6 space-y-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 px-4 bg-white/40 hover:bg-white/50 border border-white/60 rounded-xl text-sm font-semibold text-emerald-950 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Profil
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      nama: jamaah.nama,
                      no_hp: jamaah.no_hp,
                      nik: jamaah.nik,
                      alamat: jamaah.alamat || "",
                    });
                  }}
                  className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-semibold text-red-300 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Batal Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: Detail Informasi */}
        <div className="lg:col-span-8">
          <div className="h-full relative rounded-3xl shadow-xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 animate-in fade-in zoom-in-95 duration-500 delay-75 flex flex-col justify-center">
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              Detail Informasi Pribadi
            </h3>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white/40 border border-white/60 rounded-xl text-emerald-950 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider">No. HP / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={form.no_hp}
                      onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white/40 border border-white/60 rounded-xl text-emerald-950 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider">NIK</label>
                    <input
                      type="text"
                      required
                      value={form.nik}
                      onChange={(e) => setForm({ ...form, nik: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white/40 border border-white/60 rounded-xl text-emerald-950 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all shadow-inner"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea
                      rows={3}
                      value={form.alamat}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white/40 border border-white/60 rounded-xl text-emerald-950 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all resize-none shadow-inner"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center items-center px-6 py-2.5 border border-emerald-500 rounded-xl text-sm font-bold text-emerald-950 bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-900/50 transition-all"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="bg-white/40 border border-white/5 rounded-2xl p-4 hover:bg-white/50 transition-colors">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-emerald-950">{jamaah.nama}</p>
                </div>

                <div className="bg-white/40 border border-white/5 rounded-2xl p-4 hover:bg-white/50 transition-colors">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">No. HP / WhatsApp</p>
                  <p className="text-sm font-semibold text-emerald-950">{jamaah.no_hp}</p>
                </div>

                <div className="bg-white/40 border border-white/5 rounded-2xl p-4 hover:bg-white/50 transition-colors md:col-span-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Nomor Induk Kependudukan (NIK)</p>
                  <p className="text-sm font-semibold text-emerald-950">{jamaah.nik}</p>
                </div>

                <div className="bg-white/40 border border-white/5 rounded-2xl p-4 md:col-span-2 hover:bg-white/50 transition-colors">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Alamat Lengkap</p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {jamaah.alamat || <span className="text-gray-500 italic font-normal">Belum diisi</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Riwayat Tabungan dirender di luar kolom agar memanjang ke samping penuh */}
      {children}
    </div>
  );
}
