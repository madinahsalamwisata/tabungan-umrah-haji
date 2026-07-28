"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

const MySwal = Swal.mixin({
  width: '300px',
  customClass: {
    popup: 'rounded-3xl shadow-xl border border-gray-100 p-2',
    title: 'text-base font-bold text-gray-900 mt-2',
    htmlContainer: 'text-xs text-gray-600',
    confirmButton: 'text-xs font-bold px-4 py-2 rounded-xl shadow-sm',
    cancelButton: 'text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
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
  const [isNavigatingBayar, setIsNavigatingBayar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNavigatingRiwayat, setIsNavigatingRiwayat] = useState(false);
  
  // Edit states
  const [editKamar, setEditKamar] = useState(rencana.jenis_kamar);
  // Gunakan data paket live (bukan snapshot) agar jika admin merubah data, di dashboard aktif ikut berubah
  const isEstimasi = rencana.paket?.is_estimasi || false;
    
  const baseName = rencana.paket?.nama_paket || "Paket Umrah";

  const namaPaket = isEstimasi
    ? baseName.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim()
    : baseName;
    
  const tglBerangkat = rencana.paket?.tanggal_keberangkatan || rencana.paket_snapshot_tanggal_berangkat || new Date();
  const tglPulang = rencana.paket?.tanggal_kepulangan || rencana.paket_snapshot_tanggal_kepulangan || null;
  
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

  const [editJamaah, setEditJamaah] = useState(rencana.jumlah_jamaah || 1);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const sudahBayarSemua = rencana.status === "Lunas" || persentase >= 100;
  
  const riwayatSuccess = rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success");
  const cicilanKe = riwayatSuccess.length + 1;
  const sudahLunasBulanIni = cicilanKe > rencana.periode_bulan;

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const handleBayar = () => {
    setIsNavigatingBayar(true);
    router.push(`/dashboard/tabungan/${rencana.id}/bayar?from=tabungan`);
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
      <div className="hidden md:block shrink-0 w-[550px] lg:w-[650px] snap-center relative rounded-[22px] shadow-xl border border-emerald-800 bg-gradient-to-br from-hijau-800 to-hijau-900 p-8 text-white overflow-hidden transition-all duration-300">
        <div className="absolute -right-[60px] -bottom-[90px] w-[240px] h-[240px] rounded-full border border-white/9 pointer-events-none"></div>
        
        {/* Top Header of Card */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-serif font-bold text-xl text-white">{namaPaket}</h3>
              {sudahBayarSemua ? (
                <span className="bg-yellow-500 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Lunas 🎉</span>
              ) : (
                <span className="bg-emas/20 border border-emas/30 text-emas text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Aktif</span>
              )}
            </div>
            <p className="text-[12.5px] text-white/70 mt-1.5 text-left">
              Kamar {rencana.jenis_kamar} • {rencana.jumlah_jamaah} Pax • {isEstimasi ? "Estimasi" : "Jadwal"}: {isEstimasi 
                ? formatSafeDate(tglBerangkat, { month: 'long' })
                : tglPulang 
                  ? `${formatSafeDate(tglBerangkat, { day: 'numeric', month: 'short', year: 'numeric' })} - ${formatSafeDate(tglPulang, { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : formatSafeDate(tglBerangkat, { day: 'numeric', month: 'long', year: 'numeric' })
              }
            </p>
          </div>

          <div className="flex gap-2 shrink-0 z-10">
            {!sudahBayarSemua && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="w-[32px] h-[32px] rounded-full bg-white/10 text-white hover:text-emas hover:bg-white/20 transition-all flex items-center justify-center border border-white/15 cursor-pointer"
                title="Edit Rencana"
              >
                <svg className="w-4 h-4 stroke-2 fill-none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="w-[32px] h-[32px] rounded-full bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center cursor-pointer"
              title="Hapus Tabungan"
            >
              <svg className="w-4 h-4 stroke-2 fill-none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="text-[12.5px] text-white/60 mt-6 text-left">Total Tabungan</div>
        <div className="font-serif text-[38px] font-semibold tracking-tight mt-1 flex items-baseline gap-2.5 text-left">
          {formatRp(totalTerkumpul)}
          <span className="font-sans text-[13.5px] text-white/55 font-semibold">
            / {formatRp(Number(rencana.total_biaya))}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-[7px] rounded-full bg-white/16 overflow-hidden mt-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emas to-[#E4C877] transition-all duration-500"
            style={{ width: `${persentase}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2.5 text-xs text-white/60">
          <span>Terkumpul <b>{persentase.toFixed(1)}%</b></span>
          <span>Setoran per bulan: <b>{formatRp(Number(rencana.setoran_per_bulan))}</b></span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 relative z-10">
          <button
            onClick={handleBayar}
            disabled={isNavigatingBayar}
            className="px-5 py-3 rounded-xl text-[13.5px] font-bold bg-emas hover:bg-emas-deep text-hijau-900 flex items-center gap-2 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isNavigatingBayar ? (
              <>
                <div className="w-4 h-4 border-2 border-hijau-900 border-t-transparent rounded-full animate-spin"></div>
                Proses...
              </>
            ) : (
              <>
                <svg className="w-[15px] h-[15px] stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Setor
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsNavigatingRiwayat(true);
              router.push(`/dashboard/tabungan/${rencana.id}/riwayat`);
            }}
            className="px-5 py-3 rounded-xl text-[13.5px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/35 flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {isNavigatingRiwayat ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-[15px] h-[15px] stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.05 13A9 9 0 1 0 6 5.3L3 8m9-1v5l3 3" />
              </svg>
            )}
            Riwayat
          </button>
        </div>
      </div>

      {/* Mobile View (Banking App Style Card + Mutual List) */}
      <div className="md:hidden space-y-4 shrink-0 w-[85vw] max-w-[340px] snap-center h-fit">
        {/* Virtual Card */}
        <div 
          className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-5 text-white shadow-[0_10px_28px_-14px_rgba(11,61,48,0.28)] relative overflow-hidden"
        >
          {/* Decorative Circle */}
          <div className="absolute -right-12 -bottom-12 w-36 h-36 rounded-full border border-white/5 pointer-events-none"></div>

          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Perencanaan Tabungan</span>
              <h3 className="font-bold text-base leading-snug mt-0.5">
                {namaPaket}{" "}
                {sudahBayarSemua ? (
                  <span className="bg-yellow-500 text-emerald-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center align-middle relative -top-[1px] ml-1">LUNAS</span>
                ) : (
                  <span className="bg-emas/20 border border-emas/30 text-emas text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center align-middle relative -top-[1px] ml-1">AKTIF</span>
                )}
              </h3>
            </div>
            <div className="flex gap-2 shrink-0 z-10">
              {!sudahBayarSemua && (
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
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
            <span>{isEstimasi ? "Estimasi Keberangkatan" : "Jadwal Keberangkatan"}</span>
            <span className="font-bold text-white">
              {isEstimasi 
                ? formatSafeDate(tglBerangkat, { month: 'long' })
                : tglPulang 
                  ? `${formatSafeDate(tglBerangkat, { day: 'numeric', month: 'short', year: 'numeric' })} - ${formatSafeDate(tglPulang, { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : formatSafeDate(tglBerangkat, { day: 'numeric', month: 'long', year: 'numeric' })
              }
            </span>
          </div>

          <div className="flex gap-2 mt-5 z-10 relative">
            <button 
              onClick={(e) => { e.stopPropagation(); handleBayar(); }}
              disabled={isNavigatingBayar}
              className="flex-1 py-2.5 bg-emas hover:bg-emas/90 text-hijau-900 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              {isNavigatingBayar ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-hijau-900 border-t-transparent rounded-full animate-spin"></div>
                  Proses...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 stroke-hijau-900" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Setor
                </>
              )}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsNavigatingRiwayat(true); router.push(`/dashboard/tabungan/${rencana.id}/riwayat`); }}
              disabled={isNavigatingRiwayat}
              className="flex-1 py-2.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              {isNavigatingRiwayat ? "Proses..." : (
                <>
                  <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Riwayat
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Modal Edit */}
      {isEditing && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-md w-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-emerald-950 mb-4">Edit Rencana Tabungan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">Jenis Kamar</label>
                <select 
                  value={editKamar}
                  onChange={(e) => setEditKamar(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-emerald-950 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Quad">Quad (Ber-4)</option>
                  <option value="Triple">Triple (Ber-3)</option>
                  <option value="Double">Double (Ber-2)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">Jumlah Jamaah</label>
                <input 
                  type="number" 
                  min="1"
                  max={rencana.paket?.kuota || 1}
                  value={editJamaah}
                  onChange={(e) => setEditJamaah(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-emerald-950 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 leading-relaxed">
                Pembaruan ini akan otomatis menyesuaikan total biaya paket dan sisa tagihan bulanan Anda ke depan.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={submitEdit} disabled={isSubmittingEdit} className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors">
                {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
