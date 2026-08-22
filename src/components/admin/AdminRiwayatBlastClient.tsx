"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AdminRiwayatBlastClient({ riwayat }: { riwayat: any[] }) {
  const router = useRouter();
  const [selectedRiwayat, setSelectedRiwayat] = useState<any | null>(null);

  // Blast State
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastKonten, setBlastKonten] = useState(`🕋 Pengingat Cicilan Tabungan Umrah/Haji 🕋

Assalamu'alaikum Warahmatullahi Wabarakatuh,

Bapak/Ibu [Nama Jamaah] yang dirahmati Allah ﷻ,

Semoga Bapak/Ibu senantiasa dalam lindungan-Nya dan selalu diberikan kelancaran rezeki, aamiin.

Kami dari Madinah Salam Wisata ingin mengingatkan dengan penuh hormat bahwa cicilan tabungan Umrah Bapak/Ibu untuk bulan [Bulan/Tahun] masih perlu diselesaikan.

📌 Detail:
Nama : [Nama Jamaah]
Tagihan Bulan : [Bulan]
Nominal : Rp[Jumlah]

Kami percaya niat baik Bapak/Ibu untuk memenuhi panggilan Allah ke Baitullah insyaaAllah akan Allah mudahkan jalannya. Mari kita sama-sama jaga konsistensi menabung agar impian menunaikan ibadah Umrah segera terwujud. 🤲

Jika ada kendala, jangan ragu menghubungi kami, insyaAllah kami bantu carikan solusinya.

Jazakumullahu khairan atas perhatian dan kerja samanya. Semoga Allah ﷻ mudahkan segala urusan kita menuju Tanah Suci. Aamiin.... 

Wassalamu'alaikum Warahmatullahi Wabarakatuh.

Madinah Salam Wisata
📞 +62 856-9515-6701
🌐 tabunganhajiumrahku.com`);

  const showNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning') => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#146349',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-base text-hijau-900 font-bold',
        htmlContainer: 'text-xs text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2'
      }
    });
  };

  const handleBlastSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isBlasting) return;
    
    const result = await Swal.fire({
      title: 'Konfirmasi Blast',
      text: "Apakah Anda yakin ingin mengirim pengingat ini kepada SELURUH jamaah yang belum membayar cicilan bulan ini?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#146349',
      cancelButtonColor: '#94A39C',
      confirmButtonText: 'Ya, Kirim Sekarang!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-base text-hijau-900 font-bold',
        htmlContainer: 'text-xs text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2 text-sm',
        cancelButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2 text-sm',
      }
    });

    if (result.isConfirmed) {
      setIsBlasting(true);
      try {
        const res = await fetch("/api/admin/blast-pengingat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ konten: blastKonten })
        });
        
        const resData = await res.json();

        if (res.ok) {
          setIsBlastModalOpen(false);
          showNotification('Berhasil', `Blast berhasil dikirim ke ${resData.sentCount} jamaah.`, 'success');
          // Refresh the data on the page
          router.refresh();
        } else {
          showNotification('Gagal', resData.message || 'Gagal mengirim pengingat.', 'error');
        }
      } catch (e) {
        showNotification('Gagal', 'Terjadi kesalahan sistem saat mengirim blast.', 'error');
      } finally {
        setIsBlasting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sukses":
        return <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-emerald-200">SUKSES</span>;
      case "Gagal":
        return <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-red-200">GAGAL</span>;
      case "Pending":
      default:
        return <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-yellow-200">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* ----------------- KOTAK BLAST PENGINGAT ----------------- */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-[22px] shadow-sm overflow-hidden mb-8">
        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
              <svg className="w-6 h-6 stroke-emerald-700" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><polyline points="15,9 18,9 18,11"/><path d="M5.5 4a2 2 0 0 0-2 2"/><path d="M18.5 4a2 2 0 0 1 2 2"/></svg>
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-emerald-900 flex items-center gap-2">
                Blast Pengingat Cicilan
                <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-red-200">Manual</span>
              </h2>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed max-w-2xl">
                Fitur ini akan mengirimkan **Email** dan **WhatsApp** tagihan (beserta nominalnya) secara massal ke seluruh jamaah yang <strong>belum</strong> melunasi cicilan di bulan ini. Pesan ini <strong>hanya</strong> akan dikirim via email & WA, dan <strong>tidak</strong> akan muncul di dashboard umum.
              </p>
              <div className="mt-3 bg-white/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 italic line-clamp-2">
                "{blastKonten}"
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
            <button 
              onClick={() => setIsBlastModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              Edit Teks
            </button>
            <button 
              onClick={handleBlastSubmit}
              disabled={isBlasting}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isBlasting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Mengirim...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></svg>
                  Share / Blast
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-garis relative overflow-hidden">
        <h1 className="text-2xl font-bold text-hijau-900 mb-2 relative z-10">
          Riwayat Blast Pengingat
        </h1>
        <p className="text-sm text-teks-500 relative z-10">
          Laporan histori pengiriman pesan Blast via Email & WhatsApp.
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-garis shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hijau-900 text-white text-[11px] uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-white/10 rounded-tl-2xl">Nama Jamaah</th>
                <th className="p-4 font-bold border-b border-white/10 hidden sm:table-cell">Tanggal Kirim</th>
                <th className="p-4 font-bold border-b border-white/10 text-center">Status Email</th>
                <th className="p-4 font-bold border-b border-white/10 text-center">Status WA</th>
                <th className="p-4 font-bold border-b border-white/10 text-center rounded-tr-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-teks-700 divide-y divide-garis bg-white">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-teks-500 text-sm">
                    Belum ada riwayat pengiriman pesan blast.
                  </td>
                </tr>
              ) : (
                riwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-krem/30 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-hijau-900">{item.jamaah?.nama}</p>
                      <p className="text-[11px] text-teks-400 mt-1">{item.jenis_pesan}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {formatDate(item.tanggal_kirim)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status_email)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status_wa)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedRiwayat(item)}
                        className="text-[10px] font-bold bg-hijau-100 text-hijau-800 px-3 py-1.5 rounded-lg hover:bg-hijau-200 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- BLAST MODAL ----------------- */}
      {isBlastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBlastModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white border border-garis rounded-[22px] shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-base font-bold text-teks-900 mb-2">Edit Teks Blast Pengingat</h2>
            <p className="text-[11px] text-teks-500 mb-5 border-b border-garis pb-3 leading-relaxed">
              Teks ini akan disertakan di dalam Email dan WhatsApp tagihan kepada jamaah secara privat.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsBlastModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-2">Pesan Pengantar Email & WA</label>
                <textarea 
                  value={blastKonten}
                  onChange={(e) => setBlastKonten(e.target.value)}
                  required 
                  rows={15} 
                  className="w-full bg-krem border border-garis rounded-xl px-3 py-2.5 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 resize-y" 
                  placeholder="Tuliskan pesan pengantar di sini..."
                ></textarea>
                <p className="text-[10px] text-teks-400 mt-2 italic">
                  *Catatan: Variabel [Nama Jamaah], [Bulan/Tahun], [Bulan], dan [Jumlah] akan diganti otomatis oleh sistem saat pengiriman.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-garis">
                <button 
                  type="button" 
                  onClick={() => setIsBlastModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-teks-500 bg-krem hover:bg-garis/30 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 transition-colors shadow-md"
                >
                  Simpan Teks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRiwayat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hijau-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-garis rounded-[22px] shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedRiwayat(null)}
              className="absolute top-4 right-4 text-teks-400 hover:text-red-500 transition-colors p-1"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-lg font-bold text-hijau-900 mb-4 border-b border-garis pb-3">
              Detail Laporan Pengiriman
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Jamaah</p>
                <p className="font-bold text-teks-900">{selectedRiwayat.jamaah?.nama}</p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Waktu</p>
                <p className="font-medium text-teks-700">
                  {formatDate(selectedRiwayat.tanggal_kirim)}
                </p>
              </div>

              <div className="bg-krem/50 p-4 rounded-xl border border-garis space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Status Email</p>
                    {getStatusBadge(selectedRiwayat.status_email)}
                  </div>
                  {selectedRiwayat.status_email === "Gagal" && (
                    <div className="text-right w-1/2">
                      <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-1">Alasan Gagal</p>
                      <p className="text-[11px] text-red-700 leading-snug">{selectedRiwayat.keterangan_email || "Tidak diketahui"}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-garis pt-3 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-teks-400 uppercase tracking-wider mb-1">Status WhatsApp</p>
                    {getStatusBadge(selectedRiwayat.status_wa)}
                  </div>
                  {selectedRiwayat.status_wa === "Gagal" && (
                    <div className="text-right w-1/2">
                      <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider mb-1">Alasan Gagal</p>
                      <p className="text-[11px] text-red-700 leading-snug">{selectedRiwayat.keterangan_wa || "Tidak diketahui"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedRiwayat(null)}
                className="bg-krem text-teks-700 font-bold px-5 py-2.5 rounded-xl hover:bg-garis transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
