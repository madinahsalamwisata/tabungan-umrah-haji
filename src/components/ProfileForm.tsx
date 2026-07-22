"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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

export default function ProfileForm({ jamaah, children }: { jamaah: Jamaah, children?: React.ReactNode }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localFotoUrl, setLocalFotoUrl] = useState(jamaah.foto_url);
  const [localNama, setLocalNama] = useState(jamaah.nama);
  const [localNoHp, setLocalNoHp] = useState(jamaah.no_hp);
  const [localNik, setLocalNik] = useState(jamaah.nik);
  const [localAlamat, setLocalAlamat] = useState(jamaah.alamat);
  
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

      setLocalFotoUrl(data.url);
      window.dispatchEvent(new Event('profileUpdated'));
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
      setLocalNama(form.nama);
      setLocalNoHp(form.no_hp);
      setLocalNik(form.nik);
      setLocalAlamat(form.alamat);
      window.dispatchEvent(new Event('profileUpdated'));
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

        {/* KOLOM KIRI: ID Card Profile */}
        <div className="lg:col-span-4">
          <div className="h-full relative rounded-3xl overflow-hidden bg-white border border-garis shadow-sm animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center">
            <div className="relative z-10 p-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-emas/30 bg-krem shadow-sm overflow-hidden flex items-center justify-center relative">
                  {localFotoUrl ? (
                    <img src={localFotoUrl} alt={localNama} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-emas text-hijau-900 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-all"
                  title="Ganti Foto"
                >
                  <CameraIcon />
                </button>
              </div>

              {/* User Info */}
              <h2 className="text-lg font-bold text-teks-900 font-serif leading-tight mb-1">{localNama}</h2>
              <p className="text-teks-500 font-bold text-xs bg-krem px-3 py-1 rounded-full border border-garis">{jamaah.email}</p>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 px-4 bg-hijau-800 hover:bg-hijau-900 border border-hijau-750 rounded-xl text-xs font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Profil
                  </button>
                ) : (
                  <>
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
                      className="w-full py-2.5 px-4 bg-white border border-garis hover:bg-krem rounded-xl text-xs font-semibold text-teks-900 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-teks-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Batal Edit
                    </button>
                    <button
                      type="submit"
                      form="profil-form"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-emas hover:bg-emas/90 border border-emas rounded-xl text-xs font-bold text-hijau-900 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Detail Informasi */}
        <div className="lg:col-span-8">
          <div className="h-full relative rounded-3xl overflow-hidden bg-white border border-garis shadow-sm animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center">
            <div className="px-5 py-4 border-b border-garis">
              <h3 className="text-sm font-bold text-teks-900 font-serif flex items-center gap-2">
                <svg className="w-4 h-4 text-hijau-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                Detail Informasi Pribadi
              </h3>
            </div>

            <div className="p-5">
              {isEditing ? (
                <form id="profil-form" onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-krem border border-garis rounded-2xl p-4 focus-within:ring-2 focus-within:ring-hijau-800 transition-all">
                      <label className="block text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        className="block w-full bg-transparent border-none p-0 text-xs font-semibold text-teks-900 placeholder-teks-300 focus:outline-none focus:ring-0"
                      />
                    </div>

                    <div className="bg-krem border border-garis rounded-2xl p-4 focus-within:ring-2 focus-within:ring-hijau-800 transition-all">
                      <label className="block text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">No. HP / WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={form.no_hp}
                        onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                        className="block w-full bg-transparent border-none p-0 text-xs font-semibold text-teks-900 placeholder-teks-300 focus:outline-none focus:ring-0"
                      />
                    </div>

                    <div className="bg-krem border border-garis rounded-2xl p-4 focus-within:ring-2 focus-within:ring-hijau-800 transition-all sm:col-span-2">
                      <label className="block text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Nomor Induk Kependudukan (NIK)</label>
                      <input
                        type="text"
                        required
                        value={form.nik}
                        onChange={(e) => setForm({ ...form, nik: e.target.value })}
                        className="block w-full bg-transparent border-none p-0 text-xs font-semibold text-teks-900 placeholder-teks-300 focus:outline-none focus:ring-0"
                      />
                    </div>

                    <div className="bg-krem border border-garis rounded-2xl p-4 focus-within:ring-2 focus-within:ring-hijau-800 transition-all sm:col-span-2">
                      <label className="block text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={3}
                        value={form.alamat}
                        onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                        className="block w-full bg-transparent border-none p-0 text-xs font-semibold text-teks-900 placeholder-teks-300 focus:outline-none focus:ring-0 resize-none"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="bg-krem border border-garis/80 rounded-2xl p-4 transition-colors">
                    <p className="text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                    <p className="text-xs font-bold text-teks-900">{localNama}</p>
                  </div>

                  <div className="bg-krem border border-garis/80 rounded-2xl p-4 transition-colors">
                    <p className="text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">No. HP / WhatsApp</p>
                    <p className="text-xs font-bold text-teks-900">{localNoHp}</p>
                  </div>

                  <div className="bg-krem border border-garis/80 rounded-2xl p-4 transition-colors md:col-span-2">
                    <p className="text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Nomor Induk Kependudukan (NIK)</p>
                    <p className="text-xs font-bold text-teks-900">{localNik}</p>
                  </div>

                  <div className="bg-krem border border-garis/80 rounded-2xl p-4 md:col-span-2 transition-colors">
                    <p className="text-[9px] font-bold text-teks-500 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                    <p className="text-xs font-medium text-teks-800 leading-relaxed whitespace-pre-wrap">
                      {localAlamat || <span className="text-teks-300 italic font-normal">Belum diisi</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {children}

      {/* Logout button at the very bottom on mobile view */}
      <div className="pt-4 md:hidden">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100/80 active:scale-98 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-red-100 transition-all shadow-sm"
        >
          <svg className="w-4 h-4 stroke-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
