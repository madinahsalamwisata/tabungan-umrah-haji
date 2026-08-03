"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

type RiwayatSetoranItem = {
  id: string;
  bulan_ke: number;
  shadow_pembayaran?: string;
  nominal: number;
  status_pembayaran: string;
  id_transaksi_gateway: string | null;
  tanggal_setor: string;
};

type RencanaTabunganItem = {
  id: string;
  paket_nama: string;
  status: string;
  total_biaya: number;
  setoran_per_bulan: number;
  periode_bulan: number;
  tanggal_mulai: string;
  jenis_kamar: string;
  jumlah_jamaah: number;
  riwayat_setoran: RiwayatSetoranItem[];
};

type JamaahData = {
  id: string;
  nama: string;
  email: string;
  no_hp: string;
  nik: string;
  alamat: string | null;
  foto_url: string | null;
  password_plain: string | null;
  created_at: string;
  rencana_tabungan: RencanaTabunganItem[];
};

export default function AdminJamaahClient({ initialData }: { initialData: JamaahData[] }) {
  const router = useRouter();
  const [data, setData] = useState<JamaahData[]>(initialData);
  const [search, setSearch] = useState("");
  const [selectedJamaahId, _setSelectedJamaahId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("id");
    }
    return null;
  });

  const setSelectedJamaahId = (id: string | null) => {
    _setSelectedJamaahId(id);
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  };

  // Listen to browser back/forward buttons
  useState(() => {
    if (typeof window !== "undefined") {
      const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        _setSelectedJamaahId(params.get("id"));
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  });
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<JamaahData | null>(null);
  
  // Transaction history modal state
  const [activePlanForHistory, setActivePlanForHistory] = useState<RencanaTabunganItem | null>(null);

  // Find currently selected jamaah details
  const selectedJamaah = data.find(j => j.id === selectedJamaahId);

  // Helper Swal Notifications
  const showNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning') => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#146349',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-lg text-hijau-900 font-bold',
        htmlContainer: 'text-sm text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2'
      }
    });
  };

  // Search Filter
  const filteredData = data.filter(j => 
    j.nama.toLowerCase().includes(search.toLowerCase()) || 
    j.email.toLowerCase().includes(search.toLowerCase()) ||
    j.nik.includes(search)
  );

  const handleEdit = (jamaah: JamaahData) => {
    setEditingJamaah(jamaah);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jamaah?',
      text: `Apakah Anda yakin ingin menghapus jamaah ${nama} secara permanen? Semua data tabungan akan ikut terhapus!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B3423A',
      cancelButtonColor: '#94A39C',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-lg text-[#B3423A] font-bold',
        htmlContainer: 'text-sm text-teks-500',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2',
        cancelButton: 'rounded-xl shadow-lg transition-all font-bold px-6 py-2',
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/jamaah?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setData(prev => prev.filter(j => j.id !== id));
          setSelectedJamaahId(null);
          showNotification('Berhasil', 'Data jamaah berhasil dihapus!', 'success');
        } else {
          const error = await res.json();
          showNotification('Gagal', error.message, 'error');
        }
      } catch (err) {
        showNotification('Gagal', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJamaah) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedData: any = {
      id: editingJamaah.id,
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      no_hp: formData.get("no_hp") as string,
      nik: formData.get("nik") as string,
      alamat: formData.get("alamat") as string,
    };

    const password = formData.get("password") as string;
    if (password) {
      updatedData.password = password;
    }

    try {
      const res = await fetch("/api/admin/jamaah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const result = await res.json();
        // Update local state using full result
        setData(prev => prev.map(j => j.id === result.id ? { ...j, ...result } : j));
        setIsEditModalOpen(false);
        showNotification('Berhasil', 'Data berhasil diperbarui!', 'success');
      } else {
        const error = await res.json();
        showNotification('Gagal', error.message, 'error');
      }
    } catch (err) {
      showNotification('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  };

  const handleSaveNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newData = {
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      no_hp: formData.get("no_hp") as string,
      nik: formData.get("nik") as string,
      alamat: formData.get("alamat") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await fetch("/api/admin/jamaah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });

      if (res.ok) {
        const result = await res.json();
        setData(prev => [result, ...prev]);
        setIsAddModalOpen(false);
        showNotification('Berhasil', 'Jamaah baru berhasil ditambahkan!', 'success');
      } else {
        const error = await res.json();
        showNotification('Gagal', error.message, 'error');
      }
    } catch (err) {
      showNotification('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  };

  const handleRefund = async (plan: RencanaTabunganItem) => {
    // Calculate total money collected
    const totalSetoranNominal = plan.riwayat_setoran
      .filter(rs => rs.status_pembayaran === 'Lunas' || rs.status_pembayaran === 'settlement' || rs.status_pembayaran === 'success')
      .reduce((sum, rs) => sum + rs.nominal, 0);

    const totalRefunded = plan.riwayat_setoran
      .filter(rs => rs.status_pembayaran === 'refund')
      .reduce((sum, rs) => sum + Math.abs(rs.nominal), 0);

    const maxRefundable = totalSetoranNominal - totalRefunded;

    if (maxRefundable <= 0) {
      showNotification('Pemberitahuan', 'Tidak ada dana terkumpul yang dapat di-refund pada paket ini.', 'warning');
      return;
    }

    const { value: amount } = await Swal.fire({
      title: 'Proses Refund Dana',
      html: `
        <div class="text-left space-y-2 text-xs text-teks-500">
          <p>Total Terkumpul: <b>Rp ${totalSetoranNominal.toLocaleString('id-ID')}</b></p>
          <p>Sudah Di-refund: <b>Rp ${totalRefunded.toLocaleString('id-ID')}</b></p>
          <p>Maksimal Refundable: <b class="text-hijau-900">Rp ${maxRefundable.toLocaleString('id-ID')}</b></p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Masukkan Jumlah Nominal Refund (Rp)',
      inputPlaceholder: 'Contoh: 1000000',
      showCancelButton: true,
      confirmButtonColor: '#146349',
      cancelButtonColor: '#94A39C',
      confirmButtonText: 'Proses Refund',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) {
          return 'Masukkan nominal refund yang valid!';
        }
        if (Number(value) > maxRefundable) {
          return `Maksimal nominal yang dapat di-refund adalah Rp ${maxRefundable.toLocaleString('id-ID')}`;
        }
      },
      customClass: {
        popup: 'rounded-2xl border border-garis shadow-2xl',
        title: 'text-base text-hijau-900 font-bold',
        confirmButton: 'rounded-xl shadow-lg transition-all font-bold px-5 py-2 text-sm',
        cancelButton: 'rounded-xl shadow-lg transition-all font-bold px-5 py-2 text-sm',
      }
    });

    if (amount) {
      try {
        const res = await fetch("/api/admin/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rencanaTabunganId: plan.id,
            amount: Number(amount)
          })
        });

        if (res.ok) {
          const result = await res.json();
          // Update local transactions log for this plans inside data state
          setData(prev => prev.map(j => {
            if (j.id !== selectedItemId) return j;
            return {
              ...j,
              rencana_tabungan: j.rencana_tabungan.map(rt => {
                if (rt.id !== plan.id) return rt;
                return {
                  ...rt,
                  riwayat_setoran: [result.transaction, ...rt.riwayat_setoran]
                };
              })
            };
          }));
          showNotification('Berhasil', `Refund sebesar Rp ${Number(amount).toLocaleString('id-ID')} berhasil dicatat.`, 'success');
        } else {
          const err = await res.json();
          showNotification('Gagal', err.message, 'error');
        }
      } catch (err) {
        showNotification('Gagal', 'Terjadi kesalahan sistem saat memproses refund.', 'error');
      }
    }
  };

  const selectedItemId = selectedJamaahId;

  return (
    <div className="space-y-6">
      {/* ----------------- DETAIL VIEW ----------------- */}
      {selectedJamaah ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedJamaahId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-hijau-700 hover:text-hijau-900 transition-colors bg-hijau-100/50 hover:bg-hijau-100 px-3 py-2 rounded-xl"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedJamaah)}
                className="flex items-center gap-1.5 bg-hijau-900 hover:bg-hijau-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-md"
              >
                Edit Profil
              </button>
              <button
                onClick={() => handleDelete(selectedJamaah.id, selectedJamaah.nama)}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-[#B3423A] border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-md"
              >
                Hapus Akun
              </button>
            </div>
          </div>

          {/* Profile Card & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Left Card */}
            <div className="lg:col-span-1 bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] text-center flex flex-col items-center">
              {selectedJamaah.foto_url ? (
                <img 
                  src={selectedJamaah.foto_url} 
                  alt={selectedJamaah.nama} 
                  className="w-24 h-24 rounded-full object-cover border border-garis shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-3xl bg-gradient-to-br from-hijau-700 to-hijau-900 shadow-md">
                  {selectedJamaah.nama?.[0] || "J"}
                </div>
              )}
              <h2 className="text-lg font-bold text-teks-900 mt-4">{selectedJamaah.nama}</h2>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-hijau-100 text-hijau-800 px-3 py-1 rounded-full mt-2">
                Calon Jamaah
              </span>
              <div className="w-full border-t border-garis/60 my-5"></div>
              
              <div className="w-full space-y-3.5 text-xs text-left">
                <div>
                  <span className="text-teks-300 font-extrabold uppercase text-[9.5px] block tracking-wide">Nomor NIK (KTP)</span>
                  <span className="text-teks-900 font-bold mt-1 block">{selectedJamaah.nik}</span>
                </div>
                <div>
                  <span className="text-teks-300 font-extrabold uppercase text-[9.5px] block tracking-wide">Alamat Email</span>
                  <span className="text-teks-900 font-bold mt-1 block">{selectedJamaah.email}</span>
                </div>
                <div>
                  <span className="text-teks-300 font-extrabold uppercase text-[9.5px] block tracking-wide">Nomor Handphone</span>
                  <span className="text-teks-900 font-bold mt-1 block">{selectedJamaah.no_hp}</span>
                </div>
                <div>
                  <span className="text-teks-300 font-extrabold uppercase text-[9.5px] block tracking-wide">Alamat Tempat Tinggal</span>
                  <span className="text-teks-900 font-medium mt-1 block leading-relaxed">{selectedJamaah.alamat || "-"}</span>
                </div>
                <div>
                  <span className="text-teks-300 font-extrabold uppercase text-[9.5px] block tracking-wide">Password Akun</span>
                  <span className="text-teks-900 font-bold mt-1 block font-mono bg-krem px-2.5 py-1.5 rounded-lg border border-garis/80 select-all max-w-max">
                    {selectedJamaah.password_plain || "Terenkripsi (Ubah via Edit)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Plans Slider Right Panel */}
            <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
              <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex-1 text-left flex flex-col">
                <h3 className="text-sm font-bold text-teks-900">Riwayat Rencana Tabungan</h3>
                <p className="text-xs text-teks-500 mt-0.5 mb-4">Seluruh rencana tabungan aktif, dibatalkan, atau selesai.</p>

                {selectedJamaah.rencana_tabungan && selectedJamaah.rencana_tabungan.length > 0 ? (
                  <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-emerald-800/10">
                    {selectedJamaah.rencana_tabungan.map(rt => {
                      const totalTerkumpul = rt.riwayat_setoran
                        .filter(rs => rs.status_pembayaran === 'Lunas' || rs.status_pembayaran === 'settlement' || rs.status_pembayaran === 'success')
                        .reduce((sum, rs) => sum + rs.nominal, 0);

                      const totalRefund = rt.riwayat_setoran
                        .filter(rs => rs.status_pembayaran === 'refund')
                        .reduce((sum, rs) => sum + Math.abs(rs.nominal), 0);

                      const saldoSekarang = totalTerkumpul - totalRefund;

                      return (
                        <div 
                          key={rt.id} 
                          className="min-w-[280px] max-w-[320px] bg-krem border border-garis rounded-2xl p-4.5 snap-start shrink-0 flex flex-col justify-between text-left"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-bold text-teks-900 truncate" title={rt.paket_nama}>
                                {rt.paket_nama}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                rt.status === 'Aktif' 
                                  ? 'bg-hijau-100 text-hijau-800' 
                                  : rt.status === 'Dibatalkan'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-teks-300/10 text-teks-500'
                              }`}>
                                {rt.status}
                              </span>
                            </div>
                            <div className="mt-3.5 space-y-1.5 text-xs text-teks-500">
                              <div className="flex justify-between">
                                <span>Kamar:</span>
                                <span className="font-bold text-teks-900 capitalize">{rt.jenis_kamar}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Biaya:</span>
                                <span className="font-bold text-teks-900">Rp {rt.total_biaya.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Terkumpul:</span>
                                <span className="font-extrabold text-hijau-900">Rp {saldoSekarang.toLocaleString('id-ID')}</span>
                              </div>
                              {totalRefund > 0 && (
                                <div className="flex justify-between text-[#B3423A]">
                                  <span>Total Refund:</span>
                                  <span>Rp {totalRefund.toLocaleString('id-ID')}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => setActivePlanForHistory(rt)}
                              className="flex-1 text-center bg-white border border-garis hover:bg-white/80 text-teks-900 font-bold text-[11px] py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              Riwayat
                            </button>
                            <button
                              onClick={() => handleRefund(rt)}
                              className="flex-1 text-center bg-[#B3423A] hover:bg-[#A1352E] text-white font-bold text-[11px] py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              Refund
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-10 text-teks-300 italic text-sm">
                    Jamaah belum memiliki rencana tabungan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ----------------- LIST TABLE VIEW ----------------- */
        <div className="space-y-6">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Search Box matching the Header style */}
            <div className="search flex items-center gap-2 bg-krem border border-garis rounded-xl px-3.5 py-2 w-full sm:w-80">
              <svg className="w-4 h-4 stroke-teks-300 stroke-2 fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Cari nama, email, atau NIK..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none bg-transparent outline-none text-xs w-full text-teks-900 font-sans"
              />
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-hijau-900 hover:bg-hijau-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg"
            >
              <svg className="w-4 h-4 stroke-white stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg>
              Tambah Jamaah Baru
            </button>
          </div>

          {/* Clean White Table Container */}
          <div className="bg-white border border-garis rounded-[22px] shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gradient-to-r from-hijau-900 to-hijau-800 text-white">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Info Jamaah</th>
                    <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Kontak & NIK</th>
                    <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase">Jumlah Tabungan Aktif</th>
                    <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[10.5px] uppercase text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {filteredData.map((jamaah) => {
                    const activeCount = jamaah.rencana_tabungan.filter(rt => rt.status === 'Aktif').length;

                    return (
                      <tr 
                        key={jamaah.id} 
                        className="hover:bg-krem/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedJamaahId(jamaah.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {jamaah.foto_url ? (
                              <img 
                                src={jamaah.foto_url} 
                                alt={jamaah.nama} 
                                className="w-[34px] h-[34px] rounded-full object-cover shrink-0 border border-garis"
                              />
                            ) : (
                              <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-white text-[12px] bg-gradient-to-br from-hijau-700 to-hijau-900 shrink-0">
                                {jamaah.nama?.[0] || "J"}
                              </div>
                            )}
                            <div className="text-left">
                              <div className="font-bold text-teks-900 text-sm">{jamaah.nama}</div>
                              <div className="text-teks-500 text-[10px] mt-0.5">Terdaftar: {new Date(jamaah.created_at).toLocaleDateString('id-ID')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="font-semibold text-teks-900">{jamaah.email}</div>
                          <div className="text-teks-500 text-[10px] mt-0.5">{jamaah.no_hp} • NIK: {jamaah.nik}</div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <span className="font-extrabold text-base text-hijau-900 ml-4">
                            {activeCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(jamaah)}
                              className="p-2 bg-hijau-100 hover:bg-hijau-200 text-hijau-900 rounded-lg transition-colors border border-garis"
                              title="Edit Data"
                            >
                              <svg className="w-4 h-4 stroke-hijau-900 stroke-2 fill-none" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(jamaah.id, jamaah.nama)}
                              className="p-2 bg-[#FBEAE8] hover:bg-[#FBEAE8]/80 text-[#B3423A] rounded-lg transition-colors border border-red-100"
                              title="Hapus Jamaah"
                            >
                              <svg className="w-4 h-4 stroke-[#B3423A] stroke-2 fill-none" viewBox="0 0 24 24"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-teks-300 italic">
                        Tidak ada data jamaah yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- EDIT MODAL ----------------- */}
      {isEditModalOpen && editingJamaah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative w-full max-w-xl bg-white border border-garis rounded-[22px] shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-base font-bold text-teks-900 mb-5 border-b border-garis pb-3">Edit Data Jamaah</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" defaultValue={editingJamaah.nama} required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingJamaah.email} required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" defaultValue={editingJamaah.nik} required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" defaultValue={editingJamaah.no_hp} required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" defaultValue={editingJamaah.alamat || ""} rows={2} className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 resize-none"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Password Baru (Kosongkan jika tidak diubah)</label>
                  <input name="password" type="password" className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" placeholder="Masukkan password baru jika ingin mengubah" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-garis">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-teks-500 bg-krem hover:bg-garis/30 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 transition-colors shadow-md">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ADD MODAL ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="relative w-full max-w-xl bg-white border border-garis rounded-[22px] shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-base font-bold text-teks-900 mb-5 border-b border-garis pb-3">Tambah Jamaah Baru</h2>
            
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Email</label>
                  <input name="email" type="email" required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Password Awal</label>
                  <input name="password" type="password" required className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900" />
                  <p className="text-[10px] text-teks-300 mt-1">Jamaah dapat mengubah password setelah berhasil login.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-teks-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" rows={2} className="w-full bg-krem border border-garis rounded-xl px-3 py-2 text-xs text-teks-900 focus:outline-none focus:border-hijau-900 resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-garis">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-teks-500 bg-krem hover:bg-garis/30 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hijau-900 hover:bg-hijau-800 transition-colors shadow-md">
                  Simpan Jamaah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- RIWAYAT TRANSAKSI MODAL ----------------- */}
      {activePlanForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActivePlanForHistory(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-white border border-garis rounded-[22px] shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-garis pb-3 mb-4 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-teks-900">Riwayat Transaksi</h3>
                <p className="text-xs text-teks-500 mt-0.5">{activePlanForHistory.paket_nama}</p>
              </div>
              <button 
                onClick={() => setActivePlanForHistory(null)}
                className="text-teks-300 hover:text-teks-900 p-1"
              >
                <svg className="w-5 h-5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-garis text-[10px] font-extrabold uppercase text-teks-300">
                    <th scope="col" className="py-2.5">Bulan Ke</th>
                    <th scope="col" className="py-2.5">Tanggal</th>
                    <th scope="col" className="py-2.5">Nominal</th>
                    <th scope="col" className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {activePlanForHistory.riwayat_setoran.map((rs) => {
                    const isSuccess = rs.status_pembayaran === 'Lunas' || rs.status_pembayaran === 'settlement' || rs.status_pembayaran === 'success';
                    const isPending = rs.status_pembayaran === 'pending';
                    const isRefund = rs.status_pembayaran === 'refund';
                    
                    return (
                      <tr key={rs.id} className="hover:bg-krem/30">
                        <td className="py-3 font-bold text-teks-900">
                          {isRefund ? "Refund" : `Bulan Ke-${rs.bulan_ke}`}
                        </td>
                        <td className="py-3 text-teks-500">
                          {new Date(rs.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className={`py-3 font-bold ${isRefund ? "text-[#B3423A]" : "text-hijau-900"}`}>
                          {isRefund ? "-" : ""}Rp {Math.abs(rs.nominal).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3">
                          <span className={`status-pill inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wide border ${
                            isSuccess
                              ? 'bg-hijau-100 text-hijau-800 border-hijau-200/50'
                              : isPending
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200/50'
                              : 'bg-red-50 text-red-600 border-red-100/50'
                          }`}>
                            {rs.status_pembayaran}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {activePlanForHistory.riwayat_setoran.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-teks-300 italic">
                        Belum ada riwayat transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
