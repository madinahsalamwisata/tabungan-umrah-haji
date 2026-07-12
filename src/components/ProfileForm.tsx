"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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
};

export default function ProfileForm({ jamaah }: { jamaah: Jamaah }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil");

      setSuccess("Profil berhasil diperbarui!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
      {/* Header/Cover Image Area */}
      <div 
        className="h-32 bg-emerald-800 relative bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Dropdown Menu */}
        <div className="absolute top-4 right-4 z-10" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all focus:outline-none"
          >
            <DotsVerticalIcon />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                    alert("Fitur ganti foto profil saat ini sedang dalam pengembangan.");
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

      <div className="px-6 sm:px-8 pb-8 relative">
        {/* Avatar Section */}
        <div className="flex justify-between items-end -mt-12 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden flex items-center justify-center">
              <UserCircleIcon />
            </div>
            {/* Camera Overlay Button */}
            <button 
              onClick={() => alert("Fitur ganti foto profil saat ini sedang dalam pengembangan.")}
              className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full border-2 border-white shadow-sm hover:bg-emerald-700 transition-colors"
              title="Ganti Foto"
            >
              <CameraIcon />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md">
            <p className="text-sm text-emerald-700 font-medium">{success}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (Tidak bisa diubah)</label>
                <input
                  type="text"
                  disabled
                  value={jamaah.email}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 sm:text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  id="nama"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="no_hp" className="block text-sm font-semibold text-gray-700 mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  id="no_hp"
                  required
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="nik" className="block text-sm font-semibold text-gray-700 mb-1">NIK</label>
                <input
                  type="text"
                  id="nik"
                  required
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea
                  id="alamat"
                  rows={3}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
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
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 shadow-sm transition-all"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
              <p className="text-base font-medium text-gray-900">{jamaah.nama}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Alamat Email</p>
              <p className="text-base font-medium text-gray-900">{jamaah.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">No. HP / WhatsApp</p>
              <p className="text-base font-medium text-gray-900">{jamaah.no_hp}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Nomor Induk Kependudukan (NIK)</p>
              <p className="text-base font-medium text-gray-900">{jamaah.nik}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Alamat Lengkap</p>
              <p className="text-base font-medium text-gray-900 leading-relaxed">
                {jamaah.alamat || <span className="text-gray-400 italic">Belum diisi</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
