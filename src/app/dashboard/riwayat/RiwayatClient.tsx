"use client";

export default function RiwayatClient({ riwayat }: { riwayat: any[] }) {
  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden shadow-inner">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-800 text-white text-xs sm:text-sm">
              <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Tanggal & Waktu</th>
              <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Paket</th>
              <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Cicilan Ke</th>
              <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Status</th>
              <th className="p-3 sm:p-4 font-semibold whitespace-nowrap text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-200">
            {riwayat.length > 0 ? (
              riwayat.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-100/50 transition-colors bg-white">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-emerald-950 whitespace-nowrap">
                    {new Date(item.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-emerald-900 font-medium">
                    {item.nama_paket}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-emerald-950 font-bold">
                    Ke-{item.bulan_ke}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                      item.status_pembayaran === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.status_pembayaran === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {item.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-black text-emerald-700 whitespace-nowrap">
                    {formatRp(Number(item.nominal))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-emerald-600/60 bg-white text-sm">
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
