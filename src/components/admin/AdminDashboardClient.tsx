"use client";

import { useState } from "react";

interface SetoranItem {
  id: string;
  nominal: number;
  tanggal_setor: string;
  status_pembayaran: string;
  rencana_tabungan: {
    id: string;
    paket_nama: string;
    jamaah: {
      id: string;
      nama: string;
      nik: string;
      foto_url: string | null;
    }
  }
}

export default function AdminDashboardClient({ initialSetoran }: { initialSetoran: SetoranItem[] }) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredSetoran = initialSetoran.filter((item) => {
    const term = search.toLowerCase();
    const matchSearch = (
      item.rencana_tabungan.jamaah.nama.toLowerCase().includes(term) ||
      item.rencana_tabungan.jamaah.nik.includes(term) ||
      item.rencana_tabungan.paket_nama.toLowerCase().includes(term) ||
      item.status_pembayaran.toLowerCase().includes(term)
    );

    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && new Date(item.tanggal_setor) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(item.tanggal_setor) <= end;
    }

    return matchSearch && matchDate;
  });

  const [printingId, setPrintingId] = useState<string | null>(null);

  const handleCetak = async (id: string, nama: string) => {
    try {
      setPrintingId(id);
      const res = await fetch('/api/admin/kuitansi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id })
      });

      if (!res.ok) {
        throw new Error('Gagal mencetak kuitansi');
      }

      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kuitansi_${nama.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mencetak kuitansi.');
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-garis bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="text-left">
          <h3 className="text-base font-bold text-teks-900">Aktivitas Transaksi</h3>
          <p className="text-xs text-teks-500 mt-1">Daftar transaksi setoran tabungan terakhir dari jamaah.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <input 
              type="date"
              title="Dari Tanggal"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 w-[120px]"
            />
            <span className="text-teks-300 font-bold text-xs">-</span>
            <input 
              type="date"
              title="Sampai Tanggal"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 w-[120px]"
            />
          </div>

          {/* Search Box */}
          <div className="search flex items-center gap-2 bg-krem border border-garis rounded-xl px-3.5 py-2 w-full sm:w-64 shrink-0">
            <svg className="w-4 h-4 stroke-teks-300 stroke-2 fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-xs w-full text-teks-900 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Table Container with Inner Vertical Scrolling */}
      <div className="overflow-x-auto w-full">
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-garis shadow-[0_1px_0_0_rgba(231,226,214,1)]">
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300 bg-white">Jamaah</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300 bg-white">Paket Tujuan</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300 bg-white">Tanggal Setor</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300 bg-white">Nominal</th>
                <th scope="col" className="px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-wider text-teks-300 bg-white w-48">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {filteredSetoran.map((setoran) => {
                const isSuccess = setoran.status_pembayaran === 'Lunas' || setoran.status_pembayaran === 'settlement' || setoran.status_pembayaran === 'success';
                const isPending = setoran.status_pembayaran === 'pending';
                
                return (
                  <tr key={setoran.id} className="hover:bg-krem/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {setoran.rencana_tabungan.jamaah.foto_url ? (
                          <img 
                            src={setoran.rencana_tabungan.jamaah.foto_url} 
                            alt={setoran.rencana_tabungan.jamaah.nama} 
                            className="w-[34px] h-[34px] rounded-full object-cover shrink-0 border border-garis"
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-white text-[12px] bg-gradient-to-br from-hijau-700 to-hijau-900 shrink-0">
                            {setoran.rencana_tabungan.jamaah.nama?.[0] || "J"}
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-bold text-teks-900">{setoran.rencana_tabungan.jamaah.nama}</div>
                          <div className="text-[10px] text-teks-500 mt-0.5">NIK {setoran.rencana_tabungan.jamaah.nik}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-teks-900 text-left">
                      {setoran.rencana_tabungan.paket_nama}
                    </td>
                    <td className="px-6 py-4 text-teks-500 text-left">
                      {new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-hijau-900 font-bold text-left">
                      Rp {Number(setoran.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`status-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide border ${
                          isSuccess
                            ? 'bg-hijau-100 text-hijau-800 border-hijau-200/50'
                            : isPending
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200/50'
                            : 'bg-red-50 text-red-600 border-red-100/50'
                        }`}>
                          {isSuccess ? 'Success' : setoran.status_pembayaran}
                        </span>
                        {isSuccess && (
                          <button
                            onClick={() => handleCetak(setoran.id, setoran.rencana_tabungan.jamaah.nama)}
                            disabled={printingId === setoran.id}
                            className="p-1.5 rounded-lg bg-krem hover:bg-emas/20 text-emas-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            title="Cetak Kuitansi"
                          >
                            {printingId === setoran.id ? (
                              <svg className="animate-spin w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                            ) : (
                              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSetoran.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-teks-300 italic">
                    Tidak ada transaksi yang cocok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
