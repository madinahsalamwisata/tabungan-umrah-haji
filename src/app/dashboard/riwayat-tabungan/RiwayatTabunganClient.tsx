"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RiwayatTabunganClient({ riwayatList }: { riwayatList: any[] }) {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="md:hidden bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Riwayat Tabungan</h1>
            <p className="text-emerald-50/80 text-[11px] font-medium mt-0.5">Tabungan Lunas & Dibatalkan</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {riwayatList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-12">
            <div className="w-20 h-20 bg-hijau-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h2 className="text-lg font-bold text-teks-900 font-serif">Belum Ada Riwayat</h2>
            <p className="text-sm text-teks-500 mt-2 max-w-[250px]">
              Tabungan yang sudah lunas atau dibatalkan akan muncul di sini.
            </p>
          </div>
        ) : (
          riwayatList.map((rencana) => {
            const isLunas = rencana.status === "Lunas";
            
            // Prioritize snapshot data, fallback to paket (if still exists and not soft-deleted by admin)
            const namaPaket = rencana.paket_snapshot_nama || rencana.paket?.nama_paket || "Paket Tidak Diketahui";
            const isEstimasi = rencana.paket_snapshot_is_estimasi !== null 
              ? rencana.paket_snapshot_is_estimasi 
              : (rencana.paket?.is_estimasi || false);
            const tglBerangkat = rencana.paket_snapshot_tanggal_berangkat || rencana.paket?.tanggal_keberangkatan || new Date();
            
            const totalTerkumpul = rencana.RiwayatSetoran
              .filter((r: any) => r.status_pembayaran === "success")
              .reduce((sum: number, item: any) => sum + Number(item.nominal), 0);

            return (
              <div key={rencana.id} className="bg-white border border-garis rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teks-500 tracking-wider">Perencanaan Tabungan</span>
                    <h3 className="font-bold text-base leading-snug mt-0.5 text-teks-900">
                      {namaPaket}
                    </h3>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border ${
                    isLunas ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {rencana.status}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-teks-500 block">Total Dana Disetor</span>
                  <div className="text-xl font-bold flex items-baseline gap-1 mt-0.5 text-hijau-900">
                    {formatRp(totalTerkumpul)}
                    <span className="text-[11px] text-teks-500 font-medium">/ {formatRp(Number(rencana.total_biaya))}</span>
                  </div>
                </div>

                <div className="bg-krem/50 rounded-xl p-3 border border-garis/60">
                  <div className="flex justify-between items-center text-xs mb-2 pb-2 border-b border-garis/50">
                    <span className="text-teks-500">Tipe Kamar & Jamaah</span>
                    <span className="font-semibold text-teks-900">{rencana.jenis_kamar} • {rencana.jumlah_jamaah} Pax</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-teks-500">{isEstimasi ? "Estimasi Keberangkatan" : "Jadwal Keberangkatan"}</span>
                    <span className="font-bold text-teks-900">
                      {tglBerangkat 
                        ? formatSafeDate(tglBerangkat, { month: 'long', year: isEstimasi ? undefined : 'numeric' }) 
                        : "-"}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/dashboard/tabungan/${rencana.id}/riwayat`)}
                  className="w-full mt-4 py-2.5 bg-krem hover:bg-garis text-hijau-900 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 stroke-hijau-900" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Lihat Detail Setoran
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
