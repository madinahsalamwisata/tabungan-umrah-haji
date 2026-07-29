"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const MySwal = Swal.mixin({
  width: '360px',
  customClass: {
    title: 'text-lg',
    htmlContainer: 'text-sm'
  }
});

export default function RiwayatClient({ riwayat }: { riwayat: any[] }) {
  const router = useRouter();
  const [syncOrderId, setSyncOrderId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const formatSafeDate = (d: any, options?: Intl.DateTimeFormatOptions, fallback = "-") => {
    try {
      if (!d) return fallback;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return fallback;
      return dateObj.toLocaleDateString('id-ID', options);
    } catch {
      return fallback;
    }
  };

  const handleSyncManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncOrderId.trim()) {
      MySwal.fire("Info", "Silakan masukkan Order ID terlebih dahulu.", "info");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: syncOrderId.trim() })
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        await MySwal.fire({
          title: "Sinkronisasi Berhasil!",
          text: "Transaksi ditemukan dan saldo Anda telah diperbarui.",
          icon: "success"
        });
        setSyncOrderId("");
        router.refresh();
      } else {
        MySwal.fire("Gagal", data.message || "Transaksi tidak ditemukan atau belum dibayar.", "error");
      }
    } catch (err: any) {
      console.error(err);
      MySwal.fire("Error", "Terjadi kesalahan koneksi atau server.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Sync Input Box */}
      <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <h4 className="text-xs sm:text-sm font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-600" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
          </svg>
          Sinkronisasi Pembayaran Manual
        </h4>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-3.5 leading-relaxed">
          Pernah membayar cicilan tapi lupa menekan tombol verifikasi atau langsung menutup browser? Masukkan <strong>Order ID</strong> transaksi tersebut di bawah ini untuk mensinkronkan saldo Anda secara instan.
        </p>
        <form onSubmit={handleSyncManual} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Contoh: UMR-0c03eda6-BLN1-1785300300957"
            value={syncOrderId}
            onChange={(e) => setSyncOrderId(e.target.value)}
            disabled={isSyncing}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-white border border-emerald-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={isSyncing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              isSyncing ? "bg-emerald-400 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            }`}
          >
            {isSyncing ? "Mensinkronkan..." : "Sinkronkan"}
          </button>
        </form>
      </div>

      <div className="bg-slate-50/50 rounded-2xl overflow-hidden">
      {riwayat.length > 0 ? (
        <div className="flex flex-col gap-2">
          {riwayat.map((item, idx) => (
            <div key={idx} className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-100 transition-all">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.status_pembayaran === 'success' ? 'bg-emerald-50 text-emerald-500' :
                  item.status_pembayaran === 'pending' ? 'bg-amber-50 text-amber-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.status_pembayaran === 'success' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    ) : item.status_pembayaran === 'pending' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 mb-0.5 leading-tight">{item.nama_paket}</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mb-0.5 leading-tight">Cicilan Ke-{item.bulan_ke}</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400">
                    {formatSafeDate(item.tanggal_setor, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0 ml-2">
                <span className={`text-[13px] sm:text-sm font-black tracking-tight ${
                  item.status_pembayaran === 'success' ? 'text-emerald-600' :
                  item.status_pembayaran === 'pending' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {formatRp(Number(item.nominal))}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
                  item.status_pembayaran === 'success' ? 'bg-emerald-100 text-emerald-700' :
                  item.status_pembayaran === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.status_pembayaran}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-emerald-100 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
             <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="text-sm font-semibold text-gray-500">Belum ada riwayat transaksi.</span>
        </div>
      )}
      </div>
    </div>
  );
}
