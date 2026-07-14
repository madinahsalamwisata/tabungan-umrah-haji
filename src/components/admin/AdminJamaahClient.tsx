"use client";

import { useState } from "react";
import Swal from "sweetalert2";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<JamaahData | null>(null);

  // Helper Swal Notifications
  const showNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning') => {
    Swal.fire({
      title,
      text,
      icon,
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      backdrop: 'rgba(0,0,0,0.6)',
      confirmButtonColor: '#059669',
      customClass: {
        popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl',
        title: 'text-lg text-emerald-400 font-bold',
        htmlContainer: 'text-sm text-gray-200',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2'
      }
    });
  };

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
    const result = await Swal.fire({
      title: 'Hapus Jamaah?',
      text: `Apakah Anda yakin ingin menghapus jamaah ${nama} secara permanen? Semua data tabungan akan ikut terhapus!`,
      icon: 'warning',
      showCancelButton: true,
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      backdrop: 'rgba(0,0,0,0.6)',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl',
        title: 'text-lg text-red-400 font-bold',
        htmlContainer: 'text-sm text-gray-200',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2',
        cancelButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2',
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/jamaah?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(j => j.id !== id));
          showNotification('Berhasil', 'Data berhasil dihapus!', 'success');
        } else {
          const error = await res.json();
          showNotification('Gagal', error.message, 'error');
        }
      } catch (err) {
        showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
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
        showNotification('Berhasil', 'Data berhasil diperbarui!', 'success');
      } else {
        const error = await res.json();
        showNotification('Gagal', error.message, 'error');
      }
    } catch (err) {
      showNotification('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  };

  const handleSaveNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newData = {
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      no_hp: formData.get("no_hp") as string,
      nik: formData.get("nik") as string,
      alamat: formData.get("alamat") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await fetch("/api/admin/jamaah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });

      if (res.ok) {
        const result = await res.json();
        // Update tabel
        setData(prev => [result, ...prev]);
        setIsAddModalOpen(false);
        showNotification('Berhasil', 'Jamaah baru berhasil ditambahkan!', 'success');
      } else {
        const error = await res.json();
        showNotification('Gagal', error.message, 'error');
      }
    } catch (err) {
      showNotification('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error');
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
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg"
        >
          <UserPlusIcon className="w-5 h-5" />
          Tambah Jamaah Baru
        </button>
      </div>

      {/* Glassmorphism Table Container */}
      <div className="relative rounded-[2rem] shadow-2xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-black/60 text-gray-400 border-b border-white/10 backdrop-blur-md">
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
                    {jamaah.rencana_tabungan && jamaah.rencana_tabungan.length > 0 ? (
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
                    <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Edit Data Jamaah</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" defaultValue={editingJamaah.nama} required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingJamaah.email} required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" defaultValue={editingJamaah.nik} required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" defaultValue={editingJamaah.no_hp} required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" defaultValue={editingJamaah.alamat || ""} rows={3} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"></textarea>
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

      {/* Add Modal (Glassmorphism Style) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Tambah Jamaah Baru</h2>
            
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input name="email" type="email" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Password Awal</label>
                  <input name="password" type="password" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                  <p className="text-[10px] text-gray-400 mt-1">Jamaah dapat mengubah password setelah berhasil login.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" rows={2} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg">
                  Simpan Jamaah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MagnifyingGlassIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function PencilSquareIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function UserPlusIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function TrashIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

