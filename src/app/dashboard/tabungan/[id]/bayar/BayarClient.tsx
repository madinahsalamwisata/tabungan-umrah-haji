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
    <div className="bg-emerald-950 p-6 rounded-3xl shadow-inner border border-emerald-800 flex flex-col justify-between">
      <div className="mb-6">
        <h4 className="text-base font-bold text-white mb-2">Konfirmasi Pembayaran</h4>
        <p className="text-sm text-white/80 mb-6">
          {!sudahBayarSemua ? `Pembayaran untuk Cicilan ke-${cicilanKe} dari total ${rencana.periode_bulan} bulan` : "Tabungan Anda telah lunas."}
        </p>
        
        <div className="bg-emerald-900/50 p-4 rounded-xl border border-emerald-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-white/70">Nominal Setoran</span>
            <span className="text-2xl font-black text-emerald-400">{formatRp(Number(rencana.setoran_per_bulan))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60">Terkumpul Sebelumnya</span>
            <span className="text-xs text-white/90 font-bold">{formatRp(totalTerkumpul)}</span>
          </div>
        </div>
      </div>
      
      <div>
        {sudahBayarSemua || sudahLunasBulanIni ? (
          <button disabled className="w-full bg-white/5 text-white/80 font-bold py-3 px-4 rounded-xl cursor-not-allowed text-sm border border-white/10 backdrop-blur-sm">
            Sudah Dibayar Penuh
          </button>
        ) : (
          <button 
            onClick={handleBayar}
            disabled={isPaying}
            className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
                isPaying ? "bg-emerald-400/50 text-white cursor-wait" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPaying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
