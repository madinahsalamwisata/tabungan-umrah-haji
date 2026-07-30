"use client";

import { useState, useEffect } from "react";
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [vaDetails, setVaDetails] = useState<{
    vaNumber: string;
    orderId: string;
    nominal: number;
    grossAmount: number;
    expiryTime?: string;
    bankName: string;
    billerCode?: string;
  } | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("bsi");
  const [activeTab, setActiveTab] = useState<"primary" | "other">("primary");

  const sudahBayarSemua = rencana.status === "Lunas" || persentase >= 100;
  const riwayatSuccess = rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success");
  const cicilanKe = riwayatSuccess.length + 1;
  const sudahLunasBulanIni = cicilanKe > rencana.periode_bulan;

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const handleVerifikasiAutomatic = async (details: any) => {
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: details.orderId, 
          id_rencana_tabungan: rencana.id, 
          bulan_ke: cicilanKe, 
          nominal: details.nominal 
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.removeItem(`pending_payment_${rencana.id}`);
        MySwal.fire('Berhasil!', 'Pembayaran berhasil diverifikasi!', 'success').then(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const fromVal = urlParams.get("from") || "beranda";
          const isHaji = rencana.paket?.nama_paket?.toLowerCase().includes('haji') || rencana.paket_snapshot_nama?.toLowerCase().includes('haji');
          let targetUrl = "/dashboard";
          if (fromVal === "tabungan-haji" || (fromVal === "tabungan" && isHaji)) {
            targetUrl = "/dashboard/tabungan/haji";
          } else if (fromVal === "tabungan-umrah" || (fromVal === "tabungan" && !isHaji)) {
            targetUrl = "/dashboard/tabungan/umrah";
          }
          router.push(targetUrl);
        });
      }
    } catch (e) {
      console.error("Failed automatic verification check:", e);
    }
  };

  // Load pending payment from localStorage on mount and verify it
  useEffect(() => {
    const saved = localStorage.getItem(`pending_payment_${rencana.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVaDetails(parsed);
        // Automatically check the status of the saved transaction in the background
        handleVerifikasiAutomatic(parsed);
      } catch (e) {
        console.error("Failed to parse saved payment details:", e);
      }
    }
  }, [rencana.id]);

  const handleBayar = async () => {
    setIsPaying(true);
    try {
      const resToken = await fetch("/api/tabungan/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_rencana_tabungan: rencana.id, bank: selectedBank })
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

      const newVaDetails = {
        vaNumber: dataToken.va_number,
        orderId: dataToken.order_id,
        nominal: dataToken.nominal,
        grossAmount: dataToken.gross_amount,
        expiryTime: dataToken.expiry_time,
        bankName: dataToken.bank_name,
        billerCode: dataToken.biller_code
      };

      setVaDetails(newVaDetails);
      localStorage.setItem(`pending_payment_${rencana.id}`, JSON.stringify(newVaDetails));
    } catch (err: any) {
      MySwal.fire('Error', err.message, 'error');
    } finally {
      setIsPaying(false);
    }
  };

  const handleVerifikasi = async () => {
    if (!vaDetails) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: vaDetails.orderId, 
          id_rencana_tabungan: rencana.id, 
          bulan_ke: cicilanKe, 
          nominal: vaDetails.nominal 
        })
      });
      const data = await res.json();
      if (data.status === "success") {
          localStorage.removeItem(`pending_payment_${rencana.id}`);
          MySwal.fire('Berhasil!', 'Pembayaran berhasil diverifikasi!', 'success').then(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const fromVal = urlParams.get("from") || "beranda";
            const isHaji = rencana.paket?.nama_paket?.toLowerCase().includes('haji') || rencana.paket_snapshot_nama?.toLowerCase().includes('haji');
            let targetUrl = "/dashboard";
            if (fromVal === "tabungan-haji" || (fromVal === "tabungan" && isHaji)) {
              targetUrl = "/dashboard/tabungan/haji";
            } else if (fromVal === "tabungan-umrah" || (fromVal === "tabungan" && !isHaji)) {
              targetUrl = "/dashboard/tabungan/umrah";
            }
            router.push(targetUrl);
          });
      } else {
          MySwal.fire('Info', `Pembayaran belum terdeteksi. Silakan selesaikan pembayaran Anda via ${bankLabels[vaDetails.bankName.toLowerCase()] || "Virtual Account"}.`, 'info');
      }
    } catch (e) {
      console.error(e);
      MySwal.fire('Error', 'Gagal memverifikasi status pembayaran.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const bankLabels: { [key: string]: string } = {
    bsi: "BSI Virtual Account",
    bca: "BCA Virtual Account",
    mandiri: "Mandiri Bill / Multi Payment",
    bri: "BRI Virtual Account (BRIVA)",
    bni: "BNI Virtual Account",
    cimb: "CIMB Virtual Account",
    danamon: "Danamon Virtual Account"
  };

  const renderInstructions = () => {
    const bank = vaDetails?.bankName.toLowerCase() || "bsi";

    if (bank === "bsi") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi BYOND by BSI:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>BYOND by BSI</strong> di HP Anda.</li>
              <li>Pilih menu <strong>Bayar</strong> &gt; pilih <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan detail cicilan dan total bayar: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Masukkan PIN Anda untuk menyelesaikan pembayaran.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat BSI Mobile:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>BSI Mobile</strong>.</li>
              <li>Pilih menu <strong>Pembayaran</strong> &gt; pilih <strong>Institusi</strong> atau <strong>Akademik</strong>.</li>
              <li>Cari nama institusi / pilih <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor VA <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Masukkan nominal transfer <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong> (harus sama persis) dan selesaikan transaksi.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">C. Lewat ATM BSI:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM BSI dan PIN Anda.</li>
              <li>Pilih menu <strong>Pembayaran/Payment</strong> &gt; pilih <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "bca") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi BCA Mobile (m-BCA):</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>BCA Mobile</strong> dan masuk ke menu <strong>m-BCA</strong>.</li>
              <li>Pilih menu <strong>m-Transfer</strong> &gt; pilih <strong>BCA Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan detail cicilan dan total bayar: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Masukkan PIN m-BCA Anda untuk menyelesaikan pembayaran.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat KlikBCA:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Login ke <strong>KlikBCA</strong>.</li>
              <li>Pilih menu <strong>Transfer Dana</strong> &gt; pilih <strong>Transfer ke BCA Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Lanjutkan transaksi dan masukkan kode respon KeyBCA untuk menyelesaikan.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">C. Lewat ATM BCA:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM BCA dan PIN Anda.</li>
              <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Transfer</strong> &gt; <strong>Ke Rekening BCA Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "mandiri") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi Livin' by Mandiri:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>Livin' by Mandiri</strong> di HP Anda.</li>
              <li>Pilih menu <strong>Bayar</strong> &gt; cari/pilih <strong>Multi Payment</strong> (atau cari <strong>Midtrans</strong>).</li>
              <li>Masukkan Kode Perusahaan (Biller Code): <strong>{vaDetails?.billerCode}</strong>.</li>
              <li>Masukkan Bill Key (No. VA Mandiri): <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan detail cicilan dan total bayar: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Masukkan PIN Livin' Anda untuk menyelesaikan pembayaran.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat ATM Mandiri:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM Mandiri dan PIN Anda.</li>
              <li>Pilih menu <strong>Bayar/Beli</strong> &gt; pilih <strong>Lainnya</strong> &gt; pilih <strong>Multi Payment</strong>.</li>
              <li>Masukkan Kode Perusahaan (Biller Code) Midtrans: <strong>{vaDetails?.billerCode}</strong>.</li>
              <li>Masukkan Bill Key (No. VA Mandiri): <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "bri") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi BRImo:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>BRImo</strong> di HP Anda.</li>
              <li>Pilih menu <strong>BRIVA</strong>.</li>
              <li>Pilih <strong>Pembayaran Baru</strong> &gt; Masukkan nomor BRIVA: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan rincian pembayaran dan total bayar: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Masukkan PIN BRImo Anda untuk menyelesaikan pembayaran.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat ATM BRI:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM BRI dan PIN Anda.</li>
              <li>Pilih menu <strong>Transaksi Lain</strong> &gt; <strong>Pembayaran</strong> &gt; <strong>Lainnya</strong> &gt; <strong>BRIVA</strong>.</li>
              <li>Masukkan nomor BRIVA <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "bni") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi BNI Mobile Banking:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>BNI Mobile Banking</strong> di HP Anda.</li>
              <li>Pilih menu <strong>Transfer</strong> &gt; pilih <strong>Virtual Account Billing</strong>.</li>
              <li>Pilih rekening debet, lalu masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan detail cicilan dan total bayar: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Masukkan Password Transaksi Anda untuk menyelesaikan pembayaran.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat ATM BNI:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM BNI dan PIN Anda.</li>
              <li>Pilih menu <strong>Menu Lain</strong> &gt; <strong>Transfer</strong> &gt; <strong>Virtual Account Billing</strong>.</li>
              <li>Masukkan Nomor Virtual Account <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "cimb") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi OCTO Mobile:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>OCTO Mobile</strong> di HP Anda.</li>
              <li>Pilih menu <strong>Transfer</strong> &gt; pilih <strong>Transfer ke Rekening CIMB Niaga Lain</strong>.</li>
              <li>Masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Masukkan nominal transfer: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Konfirmasikan detail cicilan dan selesaikan dengan PIN transaksi Anda.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat ATM CIMB Niaga:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM CIMB Niaga dan PIN Anda.</li>
              <li>Pilih menu <strong>Pilihan Transaksi</strong> &gt; <strong>Pembayaran</strong> &gt; <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (bank === "danamon") {
      return (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">A. Lewat Aplikasi D-Bank PRO:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Buka aplikasi <strong>D-Bank PRO</strong> di HP Anda.</li>
              <li>Pilih menu <strong>Transfer</strong> &gt; pilih <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account: <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasikan rincian tagihan dan nominal transfer: <strong>{formatRp(vaDetails?.grossAmount || 0)}</strong>.</li>
              <li>Lanjutkan transaksi hingga berhasil.</li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-emerald-900 mb-1">B. Lewat ATM Danamon:</h6>
            <ul className="list-decimal pl-4 space-y-1 text-emerald-950/80">
              <li>Masukkan kartu ATM Danamon dan PIN Anda.</li>
              <li>Pilih menu <strong>Pembayaran</strong> &gt; pilih <strong>Lainnya</strong> &gt; pilih <strong>Virtual Account</strong>.</li>
              <li>Masukkan Nomor Virtual Account <strong>{vaDetails?.vaNumber}</strong>.</li>
              <li>Konfirmasi rincian pembayaran dan selesaikan transaksi.</li>
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative top background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50/50 to-white -z-10" />
      
      <div className="mb-6 z-10">
        <h4 className="text-lg font-bold text-emerald-950 mb-1">Konfirmasi Pembayaran</h4>
        <p className="text-xs text-gray-500 mb-6">
          {!sudahBayarSemua ? `Pembayaran untuk Cicilan ke-${cicilanKe} dari total ${rencana.periode_bulan} bulan` : "Tabungan Anda telah lunas."}
        </p>
        
        {/* VA Details Display or Base Billing Display */}
        {vaDetails ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* VA details Card */}
            <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-lg relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">{bankLabels[vaDetails.bankName.toLowerCase()] || "Virtual Account"}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-800 rounded-md animate-pulse">Pending</span>
              </div>
              
              {vaDetails.bankName.toLowerCase() === "mandiri" ? (
                <div className="flex flex-col gap-3.5 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-300/80 mb-1.5">Kode Perusahaan (Biller Code)</span>
                    <div className="flex items-center justify-between gap-2 bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-base sm:text-lg md:text-xl font-mono font-bold tracking-normal sm:tracking-widest break-all select-all">
                        {vaDetails.billerCode}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(vaDetails.billerCode || "");
                          MySwal.fire({
                            title: 'Tersalin!',
                            text: 'Kode Biller berhasil disalin.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] sm:text-xs font-bold text-white transition-all shrink-0 active:scale-95 cursor-pointer"
                        title="Salin Kode Biller"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                        Salin
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-300/80 mb-1.5">Bill Key (No. Rekening Mandiri VA)</span>
                    <div className="flex items-center justify-between gap-2 bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-base sm:text-lg md:text-xl font-mono font-bold tracking-normal sm:tracking-widest break-all select-all">
                        {vaDetails.vaNumber}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(vaDetails.vaNumber);
                          MySwal.fire({
                            title: 'Tersalin!',
                            text: 'Nomor Bill Key berhasil disalin.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] sm:text-xs font-bold text-white transition-all shrink-0 active:scale-95 cursor-pointer"
                        title="Salin Bill Key"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                        Salin
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] text-emerald-300/80 mb-1.5">Nomor Virtual Account</span>
                  <div className="flex items-center justify-between gap-2 bg-black/20 px-3 py-2.5 rounded-xl border border-white/5">
                    <span className="text-base sm:text-lg md:text-xl font-mono font-bold tracking-normal sm:tracking-widest break-all select-all">
                      {vaDetails.vaNumber}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(vaDetails.vaNumber);
                        MySwal.fire({
                          title: 'Tersalin!',
                          text: 'Nomor VA berhasil disalin.',
                          icon: 'success',
                          timer: 1500,
                          showConfirmButton: false
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] sm:text-xs font-bold text-white transition-all shrink-0 active:scale-95 cursor-pointer"
                      title="Salin Nomor VA"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      Salin
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-end border-t border-white/10 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-300/80 mb-0.5">Total Nominal Pembayaran</span>
                  <span className="text-lg font-black text-emas">{formatRp(vaDetails.grossAmount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-300/70 block">Sudah Termasuk Admin</span>
                  <span className="text-[10px] text-white/90 font-bold">{formatRp(4440)}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-950 space-y-3">
              <h5 className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Petunjuk Pembayaran
              </h5>

              {/* Tabs */}
              <div className="flex border-b border-emerald-250/60">
                <button
                  onClick={() => setActiveTab("primary")}
                  className={`flex-1 pb-2 font-bold text-center border-b-2 transition-all ${
                    activeTab === "primary" 
                      ? "border-emerald-600 text-emerald-900" 
                      : "border-transparent text-emerald-650/70 hover:text-emerald-800"
                  }`}
                >
                  {vaDetails.bankName.toUpperCase()} Mobile & ATM
                </button>
                <button
                  onClick={() => setActiveTab("other")}
                  className={`flex-1 pb-2 font-bold text-center border-b-2 transition-all ${
                    activeTab === "other" 
                      ? "border-emerald-600 text-emerald-900" 
                      : "border-transparent text-emerald-650/70 hover:text-emerald-800"
                  }`}
                >
                  Transfer Bank Lain
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "primary" ? (
                renderInstructions()
              ) : (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200 text-emerald-950/80">
                  <div>
                    <h6 className="font-bold text-emerald-900 mb-1">Cara Transfer dari Bank Lain (BCA, Mandiri, BRI, dll):</h6>
                    <ul className="list-decimal pl-4 space-y-1">
                      <li>Buka aplikasi M-Banking atau pergi ke ATM bank Anda.</li>
                      <li>Pilih menu <strong>Transfer ke Bank Lain</strong> (Transfer Antar Bank).</li>
                      {vaDetails.bankName.toLowerCase() === "mandiri" ? (
                        <>
                          <li>Pilih Bank Tujuan: <strong>Bank Mandiri</strong> (Kode Bank: <strong>008</strong>).</li>
                          <li>Masukkan nomor rekening tujuan (gabungan kode biller + bill key): <strong>{vaDetails.billerCode}{vaDetails.vaNumber}</strong>.</li>
                        </>
                      ) : (
                        <>
                          <li>Pilih Bank Tujuan: <strong>{bankLabels[vaDetails.bankName.toLowerCase()]?.split(" ")[0]}</strong>.</li>
                          <li>Masukkan nomor rekening tujuan: Nomor VA <strong>{vaDetails.vaNumber}</strong>.</li>
                        </>
                      )}
                      <li>Masukkan nominal transfer: <strong>{formatRp(vaDetails.grossAmount)}</strong> (jumlah harus sama persis).</li>
                      <li>Saat konfirmasi transfer, pastikan nama rekening tujuan yang muncul adalah <strong>MIDTRANS - [Nama Jamaah]</strong>.</li>
                      <li>Selesaikan pembayaran.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Nominal Card & Bank Selector */
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 mb-1">Total Nominal Pembayaran</span>
                <span className="text-3xl font-black text-emerald-950 tracking-tight">{formatRp(Number(rencana.setoran_per_bulan) + 4440)}</span>
              </div>

              <div className="border-t border-dashed border-emerald-100 pt-3 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Setoran Cicilan (Bulan ke-{cicilanKe})</span>
                  <span className="font-semibold text-emerald-950">{formatRp(Number(rencana.setoran_per_bulan))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Admin</span>
                  <span className="font-semibold text-emerald-950">{formatRp(4440)}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-emerald-100 flex justify-between items-center text-xs">
                <span className="font-medium text-gray-500">Terkumpul Sebelumnya</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">{formatRp(totalTerkumpul)}</span>
              </div>
            </div>

            {/* Bank Selector */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)] space-y-3">
              <h5 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pilih Bank Pembayaran (Virtual Account)
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "bsi", name: "BSI", desc: "Bank Syariah Indonesia" },
                  { id: "bca", name: "BCA", desc: "Bank Central Asia" },
                  { id: "mandiri", name: "Mandiri", desc: "Bank Mandiri" },
                  { id: "bri", name: "BRI", desc: "Bank Rakyat Indonesia" },
                  { id: "bni", name: "BNI", desc: "Bank Negara Indonesia" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between h-20 relative overflow-hidden ${
                      selectedBank === b.id
                        ? "border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-500/10 shadow-sm"
                        : "border-gray-200 hover:border-emerald-250 bg-white"
                    }`}
                  >
                    <span className="text-xs font-extrabold text-emerald-950">{b.name}</span>
                    <span className="text-[9.5px] text-gray-500 font-medium leading-tight">{b.desc}</span>
                    {selectedBank === b.id && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="z-10 space-y-2">
        {sudahBayarSemua || sudahLunasBulanIni ? (
          <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 px-4 rounded-2xl cursor-not-allowed text-sm border border-gray-200">
            Sudah Dibayar Penuh
          </button>
        ) : vaDetails ? (
          <>
            <button 
              onClick={handleVerifikasi}
              disabled={isVerifying}
              className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 ${
                  isVerifying ? "bg-emerald-300 text-emerald-800 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </>
              ) : "Verifikasi Pembayaran"}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem(`pending_payment_${rencana.id}`);
                setVaDetails(null);
              }}
              className="w-full font-medium py-2.5 px-4 rounded-2xl text-xs text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-1"
            >
              Kembali / Batalkan VA
            </button>
          </>
        ) : (
          <button 
            onClick={handleBayar}
            disabled={isPaying}
            className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 ${
                isPaying ? "bg-emerald-300 text-emerald-800 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isPaying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Membuat Virtual Account...
              </>
            ) : "Bayar Sekarang"}
          </button>
        )}
      </div>
    </div>
  );
}
