"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, PencilSquareIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type JamaahData = {
  id: string;
  nama: string;
  email: string;
  no_hp: string;
  nik: string;
  alamat: string | null;
  created_at: string;
  rencana_tabungan: {
    id: string;
    paket_nama: string;
    status: string;
    total_biaya: number;
  }[];
};

export default function AdminJamaahClient({ initialData }: { initialData: JamaahData[] }) {
  const [data, setData] = useState<JamaahData[]>(initialData);
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<JamaahData | null>(null);

  // Filter pencarian
  const filteredData = data.filter(j => 
    j.nama.toLowerCase().includes(search.toLowerCase()) || 
    j.email.toLowerCase().includes(search.toLowerCase()) ||
    j.nik.includes(search)
  );

  const handleEdit = (jamaah: JamaahData) => {
    setEditingJamaah(jamaah);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jamaah ${nama} secara permanen? Semua data tabungan akan ikut terhapus!`)) {
      try {
        const res = await fetch(`/api/admin/jamaah?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(j => j.id !== id));
          alert("Data berhasil dihapus!");
        } else {
          const error = await res.json();
          alert(`Gagal: ${error.message}`);
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem.");
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJamaah) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      id: editingJamaah.id,
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      no_hp: formData.get("no_hp") as string,
      nik: formData.get("nik") as string,
      alamat: formData.get("alamat") as string,
    };

    try {
      const res = await fetch("/api/admin/jamaah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const result = await res.json();
        // Update tabel
        setData(prev => prev.map(j => j.id === result.id ? { ...j, ...updatedData } : j));
        setIsEditModalOpen(false);
        alert("Data berhasil diperbarui!");
      } else {
        const error = await res.json();
        alert(`Gagal: ${error.message}`);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0f1712]/50 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm shadow-xl"
            placeholder="Cari nama, email, atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            alert("Fitur tambah manual jamaah sedang dalam pengembangan.");
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg"
        >
          <UserPlusIcon className="w-5 h-5" />
          Tambah Jamaah Baru
        </button>
      </div>

      {/* Glassmorphism Table Container */}
      <div className="relative rounded-[2rem] shadow-2xl overflow-hidden bg-[#0f1712] border border-white/10 animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute inset-0 bg-cover bg-[center_top] z-0 opacity-10" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')" }}></div>
        <div className="absolute inset-0 bg-[#0f1712]/60 backdrop-blur-md z-0"></div>
        
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-black/40 text-gray-400 border-b border-white/10 backdrop-blur-md">
              <tr>
                <th scope="col" className="px-6 py-5 font-bold tracking-wider">Info Jamaah</th>
                <th scope="col" className="px-6 py-5 font-bold tracking-wider">Kontak & NIK</th>
                <th scope="col" className="px-6 py-5 font-bold tracking-wider">Status Tabungan</th>
                <th scope="col" className="px-6 py-5 font-bold tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredData.map((jamaah) => (
                <tr key={jamaah.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-base">{jamaah.nama}</div>
                    <div className="text-gray-400 text-xs mt-1">Terdaftar: {new Date(jamaah.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-emerald-400">{jamaah.email}</div>
                    <div className="text-gray-400 text-xs mt-1">{jamaah.no_hp} • NIK: {jamaah.nik}</div>
                  </td>
                  <td className="px-6 py-4">
                    {jamaah.rencana_tabungan.length > 0 ? (
                      <div className="space-y-2">
                        {jamaah.rencana_tabungan.map(rt => (
                          <div key={rt.id} className="flex flex-col gap-1 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-xs font-semibold text-white">{rt.paket_nama}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rt.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {rt.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic text-gray-500">Belum ada paket</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(jamaah)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
                        title="Edit Data"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(jamaah.id, jamaah.nama)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20"
                        title="Hapus Jamaah"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <MagnifyingGlassIcon className="w-10 h-10 text-gray-600" />
                      <p>Tidak ada data jamaah yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (Glassmorphism Style) */}
      {isEditModalOpen && editingJamaah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-[#0f1712]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Edit Data Jamaah</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" defaultValue={editingJamaah.nama} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingJamaah.email} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" defaultValue={editingJamaah.nik} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" defaultValue={editingJamaah.no_hp} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" defaultValue={editingJamaah.alamat || ""} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
