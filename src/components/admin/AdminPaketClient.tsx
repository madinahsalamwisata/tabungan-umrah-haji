"use client";

import { useState } from "react";

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
};

export default function AdminPaketClient({ initialData }: { initialData: PaketData[] }) {
  const [data, setData] = useState<PaketData[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<PaketData | null>(null);
  
  const [activeTab, setActiveTab] = useState<"pasti" | "estimasi">("pasti");
  const [isEstimasiForm, setIsEstimasiForm] = useState(false);

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
    if (confirm(`Yakin ingin menghapus paket ${nama}?`)) {
      try {
        const res = await fetch(`/api/admin/paket?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(item => item.id !== id));
          alert("Paket dihapus.");
        } else {
          const err = await res.json();
          alert(`Gagal: ${err.message}`);
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
      poster_url: formData.get("poster_url") as string,
      is_estimasi: formData.get("is_estimasi") === "on",
    };

    try {
      const method = editingData ? "PUT" : "POST";
      const res = await fetch("/api/admin/paket", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        // parsing dates string back for UI
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
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message}`);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const paketPasti = data.filter(item => !item.is_estimasi);
  const paketEstimasi = data.filter(item => item.is_estimasi);

  const renderPaketCard = (item: PaketData) => (
    <div key={item.id} className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row group">
      {!item.is_estimasi && (
        <div className="md:w-2/5 h-48 md:h-auto relative bg-black/50">
          {item.poster_url ? (
            <img src={item.poster_url} alt={item.nama_paket} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
          )}
        </div>
      )}
      
      <div className={`p-6 flex flex-col justify-between ${item.is_estimasi ? 'w-full' : 'md:w-3/5'}`}>
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{item.nama_paket}</h3>
            {item.is_estimasi && (
              <span className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-sm">Estimasi</span>
            )}
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p>Berangkat: <span className="text-gray-200 font-medium">{new Date(item.tanggal_keberangkatan).toLocaleDateString('id-ID')}</span></p>
            <p>Maskapai: <span className="text-gray-200 font-medium">{item.maskapai}</span></p>
            <p>Kuota: <span className="text-emerald-400 font-medium">{item.kuota} Kursi</span></p>
            <p className="pt-2 text-sm text-yellow-400 font-bold">Mulai Rp {item.harga_quad.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
          <button onClick={() => handleOpenEdit(item)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Edit</button>
          <button onClick={() => handleDelete(item.id, item.nama_paket)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Hapus</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('pasti')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'pasti' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Paket Pasti Berangkat
          </button>
          <button 
            onClick={() => setActiveTab('estimasi')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'estimasi' ? 'bg-yellow-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Rencana / Estimasi
          </button>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-lg"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Paket
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'pasti' ? (
            <>
              {paketPasti.map(renderPaketCard)}
              {paketPasti.length === 0 && (
                <div className="col-span-1 lg:col-span-2 py-12 text-center text-gray-500 italic bg-white/5 rounded-[2rem] border border-white/10">
                  Belum ada paket pasti yang tersedia.
                </div>
              )}
            </>
          ) : (
            <>
              {paketEstimasi.map(renderPaketCard)}
              {paketEstimasi.length === 0 && (
                <div className="col-span-1 lg:col-span-2 py-12 text-center text-gray-500 italic bg-white/5 rounded-[2rem] border border-white/10">
                  Belum ada rencana paket estimasi.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {editingData ? "Edit Paket" : "Buat Paket Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Paket</label>
                  <input name="nama_paket" defaultValue={editingData?.nama_paket} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Misal: Paket Umrah Spesial Ramadhan" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Keberangkatan</label>
                  <input type="date" name="tanggal_keberangkatan" defaultValue={editingData?.tanggal_keberangkatan.split('T')[0]} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Kepulangan</label>
                  <input type="date" name="tanggal_kepulangan" defaultValue={editingData?.tanggal_kepulangan.split('T')[0]} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hotel Makkah</label>
                  <input name="hotel_makkah" defaultValue={editingData?.hotel_makkah} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Misal: Swissotel Makkah (*5)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hotel Madinah</label>
                  <input name="hotel_madinah" defaultValue={editingData?.hotel_madinah} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Misal: Taiba Front (*5)" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Maskapai Penerbangan</label>
                  <input name="maskapai" defaultValue={editingData?.maskapai} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Misal: Saudia Airlines (Direct)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Kuota (Orang)</label>
                  <input type="number" name="kuota" defaultValue={editingData?.kuota} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Quad (Sekamar ber-4)</label>
                  <input type="number" name="harga_quad" defaultValue={editingData?.harga_quad} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Triple (Sekamar ber-3)</label>
                  <input type="number" name="harga_triple" defaultValue={editingData?.harga_triple} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Double (Sekamar ber-2)</label>
                  <input type="number" name="harga_double" defaultValue={editingData?.harga_double} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                {!isEstimasiForm && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">URL Poster Gambar (Opsional)</label>
                    <input type="url" name="poster_url" defaultValue={editingData?.poster_url || ""} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" placeholder="Misal: /images/paket1.jpg atau https://..." />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-xl">
                <input 
                  type="checkbox" 
                  name="is_estimasi" 
                  id="is_estimasi" 
                  checked={isEstimasiForm}
                  onChange={(e) => setIsEstimasiForm(e.target.checked)}
                  className="w-5 h-5 rounded bg-black/40 border-white/10 text-yellow-500 focus:ring-yellow-500" 
                />
                <label htmlFor="is_estimasi" className="text-sm font-medium text-yellow-500 cursor-pointer">
                  Tandai sebagai Paket Estimasi (Harga dan Jadwal bisa berubah)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg">
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
