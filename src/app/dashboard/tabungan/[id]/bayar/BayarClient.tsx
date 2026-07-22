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

      window.snap.pay(dataToken.token, {
        onSuccess: async function() {
          await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        },
        onPending: async function() {
           await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        },
        onError: function() {
          MySwal.fire('Gagal!', 'Pembayaran gagal!', 'error');
          setIsPaying(false);
        },
        onClose: async function() {
          await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        }
      });
    } catch (err: any) {
      MySwal.fire('Error', err.message, 'error');
      setIsPaying(false);
    }
  };

  const syncPayment = async (order_id: string, bulan_ke: number, nominal: number) => {
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id, id_rencana_tabungan: rencana.id, bulan_ke, nominal })
      });
      const data = await res.json();
      if (data.status === "success") {
          MySwal.fire('Berhasil!', 'Pembayaran berhasil!', 'success').then(() => {
            router.push("/dashboard/tabungan");
          });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPaying(false);
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
        
        {/* Nominal Card */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          
          <div className="flex flex-col mb-4">
            <span className="text-xs font-semibold text-gray-500 mb-1">Nominal Setoran</span>
            <span className="text-3xl font-black text-emerald-950 tracking-tight">{formatRp(Number(rencana.setoran_per_bulan))}</span>
          </div>
          
          <div className="pt-4 border-t border-dashed border-emerald-100 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Terkumpul Sebelumnya</span>
            <span className="text-sm text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">{formatRp(totalTerkumpul)}</span>
          </div>
        </div>
      </div>
      
      <div className="z-10">
        {sudahBayarSemua || sudahLunasBulanIni ? (
          <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 px-4 rounded-2xl cursor-not-allowed text-sm border border-gray-200">
            Sudah Dibayar Penuh
          </button>
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
                Membuka Pembayaran...
              </>
            ) : "Bayar Sekarang"}
          </button>
        )}
      </div>
    </div>
  );
}
