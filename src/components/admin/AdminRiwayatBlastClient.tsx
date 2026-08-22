"use client";

import { useState } from "react";

export default function AdminRiwayatBlastClient({ riwayat }: { riwayat: any[] }) {
  const [selectedRiwayat, setSelectedRiwayat] = useState<any | null>(null);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sukses":
        return <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-emerald-200">SUKSES</span>;
      case "Gagal":
        return <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-red-200">GAGAL</span>;
      case "Pending":
      default:
        return <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-yellow-200">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-garis relative overflow-hidden">
        <h1 className="text-2xl font-bold text-hijau-900 mb-2 relative z-10">
          Riwayat Blast Pengingat
        </h1>
        <p className="text-sm text-teks-500 relative z-10">
          Laporan histori pengiriman pesan Blast via Email & WhatsApp.
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-garis shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hijau-900 text-white text-[11px] uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-white/10 rounded-tl-2xl">Nama Jamaah</th>
                <th className="p-4 font-bold border-b border-white/10 hidden sm:table-cell">Tanggal Kirim</th>
                <th className="p-4 font-bold border-b border-white/10 text-center">Status Email</th>
                <th className="p-4 font-bold border-b border-white/10 text-center">Status WA</th>
                <th className="p-4 font-bold border-b border-white/10 text-center rounded-tr-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-teks-700 divide-y divide-garis bg-white">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-teks-500 text-sm">
                    Belum ada riwayat pengiriman pesan blast.
                  </td>
                </tr>
              ) : (
                riwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-krem/30 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-hijau-900">{item.jamaah?.nama}</p>
                      <p className="text-[11px] text-teks-400 mt-1">{item.jenis_pesan}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {formatDate(item.tanggal_kirim)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status_email)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status_wa)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedRiwayat(item)}
                        className="text-[10px] font-bold bg-hijau-100 text-hijau-800 px-3 py-1.5 rounded-lg hover:bg-hijau-200 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRiwayat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hijau-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-garis rounded-[22px] shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedRiwayat(null)}
              className="absolute top-4 right-4 text-teks-400 hover:text-red-500 transition-colors p-1"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-lg font-bold text-hijau-900 mb-4 border-b border-garis pb-3">
              Detail Laporan Pengiriman
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Jamaah</p>
                <p className="font-bold text-teks-900">{selectedRiwayat.jamaah?.nama}</p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Waktu</p>
                <p className="font-medium text-teks-700">
                  {formatDate(selectedRiwayat.tanggal_kirim)}
                </p>
              </div>

              <div className="bg-krem/50 p-4 rounded-xl border border-garis space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Status Email</p>
                    {getStatusBadge(selectedRiwayat.status_email)}
                  </div>
                  {selectedRiwayat.status_email === "Gagal" && (
                    <div className="text-right w-1/2">
                      <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-1">Alasan Gagal</p>
                      <p className="text-[11px] text-red-700 leading-snug">{selectedRiwayat.keterangan_email || "Tidak diketahui"}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-garis pt-3 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Status WhatsApp</p>
                    {getStatusBadge(selectedRiwayat.status_wa)}
                  </div>
                  {selectedRiwayat.status_wa === "Gagal" && (
                    <div className="text-right w-1/2">
                      <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-1">Alasan Gagal</p>
                      <p className="text-[11px] text-red-700 leading-snug">{selectedRiwayat.keterangan_wa || "Tidak diketahui"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedRiwayat(null)}
                className="bg-krem text-teks-700 font-bold px-5 py-2.5 rounded-xl hover:bg-garis transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
