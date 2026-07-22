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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit states
  const [editKamar, setEditKamar] = useState(rencana.jenis_kamar);
  const [editJamaah, setEditJamaah] = useState(rencana.jumlah_jamaah || 1);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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
          MySwal.fire('Berhasil!', 'Pembayaran berhasil!', 'success');
          router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPaying(false);
    }
  };

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: "Jika sudah ada setoran masuk, hubungi admin untuk pembatalan atau *refund*.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669', // emerald-600
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/tabungan/hapus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rencana.id })
      });
      if (res.ok) {
        MySwal.fire('Terhapus!', 'Rencana tabungan Anda telah dihapus.', 'success');
        router.refresh();
      } else {
        const data = await res.json();
        MySwal.fire('Gagal', data.message, 'error');
      }
    } catch (e) {
      MySwal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const submitEdit = async () => {
    setIsSubmittingEdit(true);
    try {
      const res = await fetch("/api/tabungan/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rencana.id, jenis_kamar: editKamar, jumlah_jamaah: editJamaah })
      });
      if (res.ok) {
        MySwal.fire('Berhasil diperbarui!', 'Rencana Anda telah disesuaikan.', 'success');
        setIsEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        MySwal.fire('Gagal', data.message, 'error');
      }
    } catch (e) {
      MySwal.fire('Gagal', 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block relative rounded-2xl shadow-xl border border-emerald-800 bg-emerald-950 overflow-hidden transition-all duration-300 mb-6">
        {/* Header / Summary (Always Visible) */}
        <div 
          className="relative z-10 p-5 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="font-bold text-lg text-white">{rencana.paket.nama_paket}</h3>
              {sudahBayarSemua && (
                <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/30">LUNAS 🎉</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
              <span className="font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                {rencana.paket.is_estimasi 
                  ? new Date(rencana.paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                  : rencana.paket.tanggal_kepulangan 
                    ? `${new Date(rencana.paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(rencana.paket.tanggal_kepulangan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : new Date(rencana.paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                }
              </span>
              <span className="hidden sm:inline-block w-1 h-1 bg-gray-500 rounded-full"></span>
              <span className="text-white">Kamar {rencana.jenis_kamar} • {rencana.jumlah_jamaah || 1} Jamaah</span>
              <span className="hidden sm:inline-block w-1 h-1 bg-gray-500 rounded-full"></span>
              <span className="text-white">Terkumpul: <strong className="text-emerald-400">{formatRp(totalTerkumpul)}</strong></span>
              <span className="hidden sm:inline-block w-1 h-1 bg-gray-500 rounded-full"></span>
              <span className="text-white">Sisa: <strong className="text-white">{formatRp(sisaTagihan)}</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-4 ml-4 border-l border-white/10">
            <div className="hidden md:block w-32">
              <div className="flex justify-between text-[11px] text-white/90 mb-1 font-medium">
                <span>{persentase.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${persentase}%` }}></div>
              </div>
            </div>
            <button className={`p-2 rounded-full hover:bg-white/10 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="relative z-10 border-t border-emerald-800/50 bg-black/20 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mb-6">
              {!sudahBayarSemua && (
                  <button onClick={() => setIsEditing(true)} className="bg-white/5 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-medium px-3 py-1.5 rounded shadow-sm text-xs transition-colors backdrop-blur-sm">
                      Edit Rencana
                  </button>
              )}
              <button onClick={handleDelete} disabled={isDeleting} className="bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-medium px-3 py-1.5 rounded shadow-sm text-xs transition-colors backdrop-blur-sm">
                  {isDeleting ? "Menghapus..." : "Hapus Tabungan"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Setoran Bulanan Card */}
              <div className="bg-emerald-900/50 backdrop-blur-md p-5 rounded-xl shadow-sm border border-emerald-800 flex flex-col justify-between">
                 <div>
                   <h4 className="text-sm font-bold text-white mb-1">Setoran Bulanan</h4>
                   <p className="text-xs text-white/80 mb-4">
                     {!sudahBayarSemua ? `Pembayaran untuk Cicilan ke-${cicilanKe} dari ${rencana.periode_bulan}` : "Tabungan Anda telah lunas."}
                   </p>
                   <p className="text-3xl font-black text-emerald-400 mb-6">{formatRp(Number(rencana.setoran_per_bulan))}</p>
                 </div>
                 
                 <div>
                   {sudahBayarSemua || sudahLunasBulanIni ? (
                     <button disabled className="w-full bg-white/5 text-white/80 font-bold py-2.5 px-4 rounded-lg cursor-not-allowed text-sm border border-white/10 backdrop-blur-sm">
                       Sudah Dibayar Bulan Ini
                     </button>
                   ) : (
                     <button 
                       onClick={handleBayar}
                       disabled={isPaying}
                       className={`w-full font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm ${
                           isPaying ? "bg-emerald-400/50 text-white cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/50"
                       }`}
                     >
                       {isPaying ? "Memproses..." : "Bayar Setoran Ini"}
                     </button>
                   )}
                 </div>
              </div>

              {/* Riwayat Tabungan Card */}
              <div className="bg-emerald-900/50 backdrop-blur-md rounded-xl shadow-sm border border-emerald-800 overflow-hidden flex flex-col max-h-[250px]">
                 <div className="p-4 border-b border-emerald-800 bg-black/20">
                   <h4 className="text-sm font-bold text-white">Riwayat Setoran</h4>
                 </div>
                 <div className="overflow-y-auto flex-1 custom-scrollbar">
                   {rencana.RiwayatSetoran.length > 0 ? (
                     <ul className="divide-y divide-emerald-800/50">
                       {rencana.RiwayatSetoran.map((setoran: any) => (
                         <li key={setoran.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                           <div>
                             <p className="text-xs font-bold text-emerald-300 mb-0.5">Cicilan Ke-{setoran.bulan_ke}</p>
                             <p className="text-[10px] text-white/80">{new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-sm font-bold text-white mb-1">{formatRp(Number(setoran.nominal))}</p>
                             <span className="px-2 py-0.5 inline-flex text-[10px] font-semibold rounded-md bg-emerald-500/20 text-emerald-300 uppercase border border-emerald-500/30">
                               {setoran.status_pembayaran}
                             </span>
                           </div>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <div className="p-8 text-center text-sm text-white">
                       Belum ada riwayat setoran pembayaran.
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View (Banking App Style Card + Mutual List) */}
      <div className="md:hidden space-y-4 mb-6">
        {/* Virtual Card */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-5 text-white shadow-[0_10px_28px_-14px_rgba(11,61,48,0.28)] relative overflow-hidden"
        >
          {/* Decorative Circle */}
          <div className="absolute -right-12 -bottom-12 w-36 h-36 rounded-full border border-white/5 pointer-events-none"></div>

          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Perencanaan Tabungan</span>
              <h3 className="font-bold text-base mt-0.5 leading-snug">{rencana.paket.nama_paket}</h3>
            </div>
            {sudahBayarSemua ? (
              <span className="bg-yellow-500 text-emerald-900 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">LUNAS</span>
            ) : (
              <span className="bg-white/10 border border-white/20 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">AKTIF</span>
            )}
          </div>

          <div className="mt-5">
            <span className="text-[10px] text-white/50 block">Dana Terkumpul</span>
            <div className="text-xl font-bold flex items-baseline gap-1 mt-0.5">
              {formatRp(totalTerkumpul)}
              <span className="text-[11px] text-white/55 font-medium">/ {formatRp(Number(rencana.total_biaya))}</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="mt-4">
            <div className="h-1 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${persentase}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-white/60 mt-2">
              <span>Progress {persentase.toFixed(0)}%</span>
              <span>{rencana.jenis_kamar} • {rencana.jumlah_jamaah} Pax</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 text-[10px] text-white/60">
            <span>Estimasi Keberangkatan</span>
            <span className="font-bold text-white">
              {new Date(rencana.paket.tanggal_keberangkatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Collapsible Details Drawer */}
        {isExpanded && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
            {/* Setoran Bulanan Card */}
            {!sudahBayarSemua && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide block">Tagihan Cicilan ke-{cicilanKe}</span>
                  <span className="text-lg font-black text-emerald-950 mt-0.5 block">{formatRp(Number(rencana.setoran_per_bulan))}</span>
                </div>
                {sudahLunasBulanIni ? (
                  <span className="bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl">Sudah Bayar</span>
                ) : (
                  <button 
                    onClick={handleBayar}
                    disabled={isPaying}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {isPaying ? "Proses..." : "Setor"}
                  </button>
                )}
              </div>
            )}

            {/* Mutasi List (Riwayat Setoran) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Mutasi Setoran</h4>
              {rencana.RiwayatSetoran.length > 0 ? (
                <div className="divide-y divide-emerald-100 max-h-[220px] overflow-y-auto pr-1">
                  {rencana.RiwayatSetoran.map((setoran: any) => (
                    <div key={setoran.id} className="py-2.5 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 stroke-emerald-800" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950">Cicilan Ke-{setoran.bulan_ke}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{new Date(setoran.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-900">{formatRp(Number(setoran.nominal))}</p>
                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">SUCCESS</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-100">Belum ada riwayat setoran.</p>
              )}
            </div>

            {/* Manage Buttons */}
            <div className="flex gap-2 pt-4 border-t border-emerald-100">
              {!sudahBayarSemua && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex-1 py-2 border border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs rounded-xl text-center active:scale-98 transition-all"
                >
                  Edit Rencana
                </button>
              )}
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl text-center active:scale-98 transition-all"
              >
                {isDeleting ? "Menghapus..." : "Hapus Tabungan"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-white mb-4">Edit Rencana Tabungan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Jenis Kamar</label>
                <select 
                  value={editKamar}
                  onChange={(e) => setEditKamar(e.target.value)}
                  className="w-full bg-hijau-900 border border-emerald-700/80 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-emas"
                >
                  <option value="Quad">Quad (Ber-4)</option>
                  <option value="Triple">Triple (Ber-3)</option>
                  <option value="Double">Double (Ber-2)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Jumlah Jamaah</label>
                <input 
                  type="number" 
                  min="1"
                  max={rencana.paket.kuota}
                  value={editJamaah}
                  onChange={(e) => setEditJamaah(Number(e.target.value))}
                  className="w-full bg-hijau-900 border border-emerald-700/80 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-emas"
                />
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white/70 leading-relaxed">
                Pembaruan ini akan otomatis menyesuaikan total biaya paket dan sisa tagihan bulanan Anda ke depan.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/15">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={submitEdit} disabled={isSubmittingEdit} className="px-4 py-2 text-xs font-semibold text-hijau-900 bg-emas hover:bg-emas/90 rounded-xl transition-colors">
                {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
