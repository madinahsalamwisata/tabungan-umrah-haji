"use client";

import { useState } from "react";

type PengumumanData = {
  id: string;
  judul: string;
  konten: string;
  is_penting: boolean;
  created_at: string;
};

export default function AdminPengumumanClient({ initialData }: { initialData: PengumumanData[] }) {
  const [data, setData] = useState<PengumumanData[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<PengumumanData | null>(null);

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PengumumanData) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus pengumuman ini?")) {
      try {
        const res = await fetch(`/api/admin/pengumuman?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(item => item.id !== id));
        } else {
          alert("Gagal menghapus pengumuman.");
        }
      } catch (e) {
        alert("Terjadi kesalahan.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: editingData?.id,
      judul: formData.get("judul") as string,
      konten: formData.get("konten") as string,
      is_penting: formData.get("is_penting") === "on",
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
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Pengumuman Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map(item => (
          <div key={item.id} className={`relative rounded-2xl p-6 shadow-xl border ${item.is_penting ? 'bg-yellow-900/20 backdrop-blur-xl border-yellow-500/30' : 'bg-black/60 backdrop-blur-xl border-white/10'}`}>
            {item.is_penting && (
              <span className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full font-bold border border-yellow-500/30">
                Penting
              </span>
            )}
            <h3 className="text-xl font-bold text-white pr-20">{item.judul}</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">{new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="text-sm text-gray-300 line-clamp-3">{item.konten}</p>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => handleOpenEdit(item)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Hapus</button>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 italic bg-white/5 rounded-2xl border border-white/10">
            Belum ada pengumuman yang disebar.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {editingData ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Judul Pengumuman</label>
                <input name="judul" defaultValue={editingData?.judul} required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Contoh: Pembaruan Jadwal Manasik" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Isi Pesan</label>
                <textarea name="konten" defaultValue={editingData?.konten} required rows={5} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none" placeholder="Tuliskan isi pengumuman lengkap di sini..."></textarea>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="is_penting" id="is_penting" defaultChecked={editingData?.is_penting} className="w-4 h-4 rounded bg-black/60 border-white/10 text-emerald-500 focus:ring-emerald-500" />
                <label htmlFor="is_penting" className="text-sm font-medium text-gray-300">Tandai sebagai Informasi Penting (Sorotan Kuning)</label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg">
                  {editingData ? "Simpan Perubahan" : "Sebarkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
