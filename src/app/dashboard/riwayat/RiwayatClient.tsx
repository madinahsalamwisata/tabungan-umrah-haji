"use client";

export default function RiwayatClient({ riwayat }: { riwayat: any[] }) {
  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-slate-50/50 rounded-2xl overflow-hidden">
      {riwayat.length > 0 ? (
        <div className="flex flex-col gap-2">
          {riwayat.map((item, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center justify-between hover:border-emerald-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.status_pembayaran === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  item.status_pembayaran === 'pending' ? 'bg-amber-50 text-amber-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <span className="text-[13px] font-bold text-emerald-950 mb-0.5">{item.nama_paket}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 mb-0.5">Cicilan Ke-{item.bulan_ke}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-sm font-black tracking-tight ${
                  item.status_pembayaran === 'success' ? 'text-emerald-600' :
                  item.status_pembayaran === 'pending' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {formatRp(Number(item.nominal))}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
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
  );
}
