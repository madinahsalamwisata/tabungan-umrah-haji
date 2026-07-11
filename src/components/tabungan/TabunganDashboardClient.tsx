"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Extend window object to include snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function TabunganDashboardClient({ 
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

  // Cek apakah bulan ini sudah dibayar (asumsi riwayat setoran = bulan berjalan)
  const sudahBayarSemua = rencana.status === "Lunas" || persentase >= 100;
  
  const riwayatSuccess = rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success");
  const cicilanKe = riwayatSuccess.length + 1;
  const sudahLunasBulanIni = cicilanKe > rencana.periode_bulan; // if cicilanKe > periode_bulan, it's paid off

  const handleBayar = async () => {
    setIsPaying(true);
    try {
      // 1. Dapatkan Token Snap dari Backend
      const resToken = await fetch("/api/tabungan/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_rencana_tabungan: rencana.id })
      });

      const dataToken = await resToken.json();

      if (!resToken.ok) {
        throw new Error(dataToken.message || "Gagal membuat transaksi");
      }

      // 2. Tampilkan Popup Snap
      window.snap.pay(dataToken.token, {
        onSuccess: async function(result: any) {
          // 3. Verifikasi & Simpan ke DB
          await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        },
        onPending: async function(result: any) {
           await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        },
        onError: function(result: any) {
          alert("Pembayaran gagal!");
          setIsPaying(false);
        },
        onClose: async function() {
          // User close popup, check if payment actually succeeded
          await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        }
      });
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsPaying(false);
    }
  };

  const syncPayment = async (order_id: string, bulan_ke: number, nominal: number) => {
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            order_id, 
            id_rencana_tabungan: rencana.id,
            bulan_ke,
            nominal
        })
      });
      
      const data = await res.json();
      if (data.status === "success") {
          alert("Pembayaran berhasil!");
          router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPaying(false);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-900">Ringkasan Tabungan</h2>
        {sudahBayarSemua && (
          <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-sm">
            LUNAS 🎉
          </span>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-emerald-900">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paket Terpilih</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{rencana.paket.nama_paket}</p>
              <p className="text-sm text-gray-600 mt-1">Kamar {rencana.jenis_kamar}</p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Biaya</span>
                <span className="font-bold text-gray-900">{formatRp(Number(rencana.total_biaya))}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Total Terkumpul</span>
                <span className="font-bold text-emerald-700">{formatRp(totalTerkumpul)}</span>
              </div>
              
              <div className="w-full bg-emerald-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-emerald-700 h-2.5 rounded-full" 
                  style={{ width: `${persentase}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-emerald-900 font-medium mt-1">
                <span>{persentase.toFixed(1)}% Terkumpul</span>
                <span>Sisa: {formatRp(sisaTagihan)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setoran Bulanan</h3>
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">Nominal Setoran per Bulan</p>
                <p className="text-2xl font-black text-emerald-900">{formatRp(Number(rencana.setoran_per_bulan))}</p>
                {!sudahBayarSemua && (
                    <p className="text-xs text-gray-500 mt-1">Pembayaran untuk Cicilan ke-{cicilanKe} dari {rencana.periode_bulan}</p>
                )}
              </div>
              
              <div>
                {sudahBayarSemua || sudahLunasBulanIni ? (
                  <button disabled className="bg-gray-300 text-gray-600 font-medium py-3 px-6 rounded-md shadow-sm cursor-not-allowed">
                    Sudah Lunas
                  </button>
                ) : (
                  <button 
                    onClick={handleBayar}
                    disabled={isPaying}
                    className={`font-medium py-3 px-6 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 ${
                        isPaying ? "bg-emerald-400 text-white cursor-wait" : "bg-emerald-900 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    {isPaying ? "Memproses..." : "Bayar Setoran Ini"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-emerald-900 mt-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Setoran</h3>
        </div>
        <div className="border-t border-gray-200">
          {rencana.RiwayatSetoran.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {rencana.RiwayatSetoran.map((setoran: any) => (
                <li key={setoran.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Cicilan Ke-{setoran.bulan_ke}</p>
                    <p className="text-xs text-gray-500">{new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">{formatRp(Number(setoran.nominal))}</span>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {setoran.status_pembayaran}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Belum ada riwayat setoran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
