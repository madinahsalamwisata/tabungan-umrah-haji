"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const MySwal = Swal.mixin({
  width: '360px',
  customClass: {
    title: 'text-lg',
    htmlContainer: 'text-sm'
  }
});

declare global {
  interface Window {
    snap: any;
  }
}

export default function BayarClient({ 
  rencana, 
  totalTerkumpul, 
  sisaTagihan, 
  persentase 
}: { 
  rencana: any, 
  totalTerkumpul: number, 
  sisaTagihan: number, 
  persentase: number 
}) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [vaDetails, setVaDetails] = useState<{
    vaNumber: string;
    orderId: string;
    nominal: number;
    grossAmount: number;
    expiryTime?: string;
  } | null>(null);

  const sudahBayarSemua = rencana.status === "Lunas" || persentase >= 100;
  const riwayatSuccess = rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success");
  const cicilanKe = riwayatSuccess.length + 1;
  const sudahLunasBulanIni = cicilanKe > rencana.periode_bulan;

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const handleBayar = async () => {
    setIsPaying(true);
    try {
      const resToken = await fetch("/api/tabungan/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_rencana_tabungan: rencana.id })
      });
      const dataToken = await resToken.json();
      if (!resToken.ok) {
         let errMsg = dataToken.message || "Gagal membuat transaksi";
         if (dataToken.detail && dataToken.detail.error_messages) {
            errMsg += ": " + dataToken.detail.error_messages.join(', ');
         } else if (dataToken.detail) {
            errMsg += ": " + JSON.stringify(dataToken.detail);
         }
         throw new Error(errMsg);
      }

      setVaDetails({
        vaNumber: dataToken.va_number,
        orderId: dataToken.order_id,
        nominal: dataToken.nominal,
        grossAmount: dataToken.gross_amount,
        expiryTime: dataToken.expiry_time
      });
    } catch (err: any) {
      MySwal.fire('Error', err.message, 'error');
    } finally {
      setIsPaying(false);
    }
  };

  const handleVerifikasi = async () => {
    if (!vaDetails) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: vaDetails.orderId, 
          id_rencana_tabungan: rencana.id, 
          bulan_ke: cicilanKe, 
          nominal: vaDetails.nominal 
        })
      });
      const data = await res.json();
      if (data.status === "success") {
          MySwal.fire('Berhasil!', 'Pembayaran berhasil diverifikasi!', 'success').then(() => {
            router.push("/dashboard/tabungan");
          });
      } else {
          MySwal.fire('Info', 'Pembayaran belum terdeteksi. Silakan selesaikan pembayaran Anda via BSI Virtual Account.', 'info');
      }
    } catch (e) {
      console.error(e);
      MySwal.fire('Error', 'Gagal memverifikasi status pembayaran.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative top background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50/50 to-white -z-10" />
      
      <div className="mb-6 z-10">
        <h4 className="text-lg font-bold text-emerald-950 mb-1">Konfirmasi Pembayaran</h4>
        <p className="text-xs text-gray-500 mb-6">
          {!sudahBayarSemua ? `Pembayaran untuk Cicilan ke-${cicilanKe} dari total ${rencana.periode_bulan} bulan` : "Tabungan Anda telah lunas."}
        </p>
        
        {/* VA Details Display or Base Billing Display */}
        {vaDetails ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* BSI VA details Card */}
            <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-lg relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">Bank Syariah Indonesia (BSI) VA</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-800 rounded-md">Pending</span>
              </div>
              
              <div className="flex flex-col mb-4">
                <span className="text-[10px] text-emerald-300/80 mb-0.5">Nomor Virtual Account</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-widest">{vaDetails.vaNumber}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(vaDetails.vaNumber);
                      MySwal.fire({
                        title: 'Tersalin!',
                        text: 'Nomor VA berhasil disalin ke clipboard.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                      });
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-emerald-300 hover:text-white"
                    title="Salin Nomor VA"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-white/10 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-300/80 mb-0.5">Total Nominal Pembayaran</span>
                  <span className="text-lg font-black text-emas">{formatRp(vaDetails.grossAmount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-300/70 block">Sudah Termasuk Admin</span>
                  <span className="text-[10px] text-white/90 font-bold">{formatRp(4440)}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-950 space-y-2">
              <h5 className="font-bold flex items-center gap-1.5 text-emerald-900">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Petunjuk Pembayaran
              </h5>
              <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
                <li>Buka aplikasi <strong>BYOND by BSI</strong> / BSI Mobile atau ke ATM BSI.</li>
                <li>Pilih menu <strong>Pembayaran/Payment</strong> &gt; <strong>Virtual Account</strong>.</li>
                <li>Masukkan Nomor Virtual Account <strong>{vaDetails.vaNumber}</strong>.</li>
                <li>Konfirmasikan nama jamaah, cicilan, dan jumlah nominal transfer.</li>
                <li>Setelah transfer berhasil, klik tombol <strong>Verifikasi Pembayaran</strong> di bawah ini.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Nominal Card */
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            
            <div className="flex flex-col mb-4">
              <span className="text-xs font-semibold text-gray-500 mb-1">Nominal Setoran (Termasuk Admin)</span>
              <span className="text-3xl font-black text-emerald-950 tracking-tight">{formatRp(Number(rencana.setoran_per_bulan) + 4440)}</span>
            </div>
            
            <div className="pt-4 border-t border-dashed border-emerald-100 flex justify-between items-center text-xs">
              <span className="font-medium text-gray-500">Terkumpul Sebelumnya</span>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">{formatRp(totalTerkumpul)}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="z-10 space-y-2">
        {sudahBayarSemua || sudahLunasBulanIni ? (
          <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 px-4 rounded-2xl cursor-not-allowed text-sm border border-gray-200">
            Sudah Dibayar Penuh
          </button>
        ) : vaDetails ? (
          <>
            <button 
              onClick={handleVerifikasi}
              disabled={isVerifying}
              className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 ${
                  isVerifying ? "bg-emerald-300 text-emerald-800 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </>
              ) : "Verifikasi Pembayaran"}
            </button>
            <button 
              onClick={() => setVaDetails(null)}
              className="w-full font-medium py-2.5 px-4 rounded-2xl text-xs text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-1"
            >
              Kembali / Batalkan VA
            </button>
          </>
        ) : (
          <button 
            onClick={handleBayar}
            disabled={isPaying}
            className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 ${
                isPaying ? "bg-emerald-300 text-emerald-800 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isPaying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Membuat Virtual Account...
              </>
            ) : "Bayar Sekarang"}
          </button>
        )}
      </div>
    </div>
  );
}
