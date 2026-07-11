"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
          Swal.fire('Gagal!', 'Pembayaran gagal!', 'error');
          setIsPaying(false);
        },
        onClose: async function() {
          await syncPayment(dataToken.order_id, cicilanKe, dataToken.nominal);
        }
      });
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
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
          Swal.fire('Berhasil!', 'Pembayaran berhasil!', 'success');
          router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPaying(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
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
        Swal.fire('Terhapus!', 'Rencana tabungan Anda telah dihapus.', 'success');
        router.refresh();
      } else {
        const data = await res.json();
        Swal.fire('Gagal', data.message, 'error');
      }
    } catch (e) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
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
        Swal.fire('Berhasil diperbarui!', 'Rencana Anda telah disesuaikan.', 'success');
        setIsEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        Swal.fire('Gagal', data.message, 'error');
      }
    } catch (e) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-900">Ringkasan Tabungan</h2>
        <div className="flex gap-2">
            {!sudahBayarSemua && (
                <button onClick={() => setIsEditing(true)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-4 py-2 rounded shadow-sm text-sm transition-colors">
                    Edit Rencana
                </button>
            )}
            <button onClick={handleDelete} disabled={isDeleting} className="bg-red-100 hover:bg-red-200 text-red-900 font-bold px-4 py-2 rounded shadow-sm text-sm transition-colors">
                {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
            {sudahBayarSemua && (
              <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-sm ml-2">
                LUNAS 🎉
              </span>
            )}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-6 shadow-sm">
        <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Informasi Penting
        </h4>
        <p className="text-sm text-emerald-800 leading-relaxed">
          Kalkulasi biaya tabungan di bawah ini merupakan <strong>estimasi awal</strong>. Harga final paket Umrah dapat berubah sewaktu-waktu menyesuaikan dengan dinamika harga tiket pesawat, akomodasi hotel, kebijakan visa, dan komponen harga lainnya pada saat tahun keberangkatan Anda. Kami akan terus menginformasikan setiap pembaruan harga secara transparan.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-emerald-900">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paket Terpilih</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{rencana.paket.nama_paket}</p>
              <p className="text-sm text-gray-600 mt-1">Kamar {rencana.jenis_kamar} • {rencana.jumlah_jamaah || 1} Jamaah</p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Estimasi Total Biaya</span>
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
                    Sudah Dibayar Bulan Ini
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
          <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Tabungan</h3>
          <p className="text-sm text-gray-500 mt-1">Daftar setoran pembayaran yang telah Anda lakukan untuk paket ini.</p>
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
              Belum ada riwayat setoran pembayaran.
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Rencana Tabungan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">Jenis Kamar</label>
                <select 
                  value={editKamar}
                  onChange={(e) => setEditKamar(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                  max={rencana.paket.kuota}
                  value={editJamaah}
                  onChange={(e) => setEditJamaah(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded text-sm text-emerald-800">
                Pembaruan ini akan otomatis menyesuaikan total biaya paket dan sisa tagihan bulanan Anda ke depan.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
                Batal
              </button>
              <button onClick={submitEdit} disabled={isSubmittingEdit} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded">
                {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
