"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  CheckCircle2, 
  Info, 
  FileText, 
  CreditCard, 
  Briefcase 
} from "lucide-react";
import Swal from "sweetalert2";

declare global {
  interface Window {
    snap: any;
  }
}

// Helper component untuk kotak glassmorphism murni
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-2xl bg-white/90 backdrop-blur-xl border border-gray-200 transition-all duration-300 hover:bg-white hover:shadow-lg ${className}`}>
    <div className="relative z-10 p-4 sm:p-6">
      {children}
    </div>
  </div>
);

export default function DashboardClient({ 
  initialPengumuman,
  userNama = "Jamaah",
  savingsPlans = []
}: { 
  initialPengumuman: any[];
  userNama?: string;
  savingsPlans?: {
    namaPaket: string;
    totalTerkumpul: number;
    targetBiaya: number;
    percentage: number;
    formattedTargetDate: string;
    idRencana: string;
    jenisKamar: string;
    jumlahJamaah: number;
    cicilanKe: number;
  }[];
}) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>(Array.isArray(initialPengumuman) ? initialPengumuman : []);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [isNavigatingRiwayat, setIsNavigatingRiwayat] = useState<string | null>(null);
  const router = useRouter();

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

  const syncPayment = async (order_id: string, idRencana: string, nominal: number, cicilanKe: number) => {
    try {
      const res = await fetch("/api/tabungan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id, id_rencana_tabungan: idRencana, bulan_ke: cicilanKe, nominal })
      });
      const data = await res.json();
      if (data.status === "success") {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Pembayaran berhasil!',
            icon: 'success',
            confirmButtonColor: '#059669',
            customClass: { popup: 'rounded-3xl' }
          }).then(() => {
            window.location.reload();
          });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPaying(null);
    }
  };

  const handleBayar = async (idRencana: string, cicilanKe: number) => {
    setIsPaying(idRencana);
    try {
      const resToken = await fetch("/api/tabungan/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_rencana_tabungan: idRencana })
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

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(dataToken.token, {
          onSuccess: async function() {
            await syncPayment(dataToken.order_id, idRencana, dataToken.nominal, cicilanKe);
          },
          onPending: async function() {
             await syncPayment(dataToken.order_id, idRencana, dataToken.nominal, cicilanKe);
          },
          onError: function() {
            Swal.fire({
              title: 'Gagal!',
              text: 'Pembayaran gagal!',
              icon: 'error',
              confirmButtonColor: '#059669',
              customClass: { popup: 'rounded-3xl' }
            });
            setIsPaying(null);
          },
          onClose: async function() {
            await syncPayment(dataToken.order_id, idRencana, dataToken.nominal, cicilanKe);
          }
        });
      } else {
        throw new Error("Sistem pembayaran sedang memuat, mohon coba kembali dalam beberapa detik.");
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#059669',
        customClass: { popup: 'rounded-3xl' }
      });
      setIsPaying(null);
    }
  };

  useEffect(() => {
    const fetchPengumuman = () => {
      fetch("/api/admin/pengumuman")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPengumumanList(data);
          }
        })
        .catch(err => console.error("Gagal load pengumuman", err));
    };

    // Panggil pertama kali
    fetchPengumuman();

    // Polling setiap 60 detik (60000 ms) agar tidak membebani koneksi/server
    const interval = setInterval(fetchPengumuman, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleAccordion = (id: string) => {
    if (openAccordion === id) {
      setOpenAccordion(null);
    } else {
      setOpenAccordion(id);
    }
  };
  const showPengumumanPopup = (item: any) => {
    Swal.fire({
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#146349',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.5)',
      html: `
        <div class="text-left mt-1">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h3 class="text-base font-bold text-gray-900 leading-snug">${item.judul}</h3>
            ${item.is_penting ? '<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wide border bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500/30">Penting</span>' : ''}
          </div>
          <p class="text-[10px] text-gray-400 mt-1">
            Disiarkan pada ${formatSafeDate(item.created_at, { dateStyle: 'long' })}
          </p>
          <div class="border-t border-gray-100 my-3"></div>
          <div class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-1" style="scrollbar-width: thin;">
            ${item.konten}
          </div>
          <div class="border-t border-gray-100 mt-3.5 pb-2"></div>
        </div>
      `,
      customClass: {
        popup: 'rounded-[22px] border border-gray-100 shadow-2xl p-5 text-left',
        htmlContainer: '!m-0 !p-0',
        confirmButton: 'bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold px-4 py-2 transition-colors shadow-md float-right mr-1 mb-1',
        actions: 'w-full !m-0 !p-0 flex justify-end',
        closeButton: 'text-gray-300 hover:text-gray-900 !outline-none'
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Desktop View */}
        <div className="hidden md:block space-y-6">
          <div className="page-head mb-6">
            <h1 className="font-display font-semibold text-3xl text-teks-900 leading-tight">
              Assalamu&apos;alaikum, {userNama} 👋
            </h1>
            <p className="text-[13.5px] text-teks-500 mt-1">
              Berikut ringkasan tabungan dan informasi terbaru untuk perjalanan ibadah Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
            {/* Kolom Kiri: Kartu Saldo / Empty State */}
            <div className="space-y-6">
              {savingsPlans && savingsPlans.length > 0 ? (
                <div className="relative group/slider">
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-none pb-2">
                    {savingsPlans.map((plan) => (
                      <div
                        key={plan.idRencana}
                        className="min-w-full snap-center bg-gradient-to-br from-hijau-800 to-hijau-900 rounded-[22px] p-8 text-white shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] relative overflow-hidden"
                      >
                        <div className="absolute -right-[60px] -bottom-[90px] w-[240px] h-[240px] rounded-full border border-white/9 pointer-events-none"></div>
                        <div className="text-[13.5px] text-white/70 font-semibold">{plan.namaPaket}</div>
                        <div className="text-[12.5px] text-white/60 mt-4">Total Tabungan</div>
                        <div className="font-serif text-[38px] font-semibold tracking-tight mt-1 flex items-baseline gap-2.5">
                          Rp {plan.totalTerkumpul.toLocaleString("id-ID")}
                          <span className="font-sans text-[13.5px] text-white/55 font-semibold">
                            / Rp {plan.targetBiaya.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="h-[7px] rounded-full bg-white/16 overflow-hidden mt-5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emas to-[#E4C877] transition-all duration-500"
                            style={{ width: `${plan.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2.5 text-xs text-white/60">
                          <span>Terkumpul <b>{plan.percentage}%</b></span>
                          <span>Target {plan.formattedTargetDate}</span>
                        </div>
                        <div className="flex gap-3 mt-6 relative z-10">
                          <button
                            onClick={() => handleBayar(plan.idRencana, plan.cicilanKe)}
                            disabled={isPaying === plan.idRencana}
                            className="px-5 py-3 rounded-xl text-[13.5px] font-bold bg-emas hover:bg-emas-deep text-hijau-900 flex items-center gap-2 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {isPaying === plan.idRencana ? (
                              <div className="w-4 h-4 border-2 border-hijau-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-[15px] h-[15px] stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                            Setor
                          </button>
                          <button
                            onClick={() => {
                              setIsNavigatingRiwayat(plan.idRencana);
                              router.push(`/dashboard/tabungan/${plan.idRencana}/riwayat`);
                            }}
                            className="px-5 py-3 rounded-xl text-[13.5px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/35 flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            {isNavigatingRiwayat === plan.idRencana ? (
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
                    ))}
                  </div>
                  {savingsPlans.length > 1 && (
                    <div className="absolute bottom-6 right-8 flex items-center gap-1.5 bg-black/25 backdrop-blur-md rounded-full px-2.5 py-1 z-20">
                      <span className="text-[10px] text-white/90 font-medium">Geser</span>
                      <svg className="w-3.5 h-3.5 text-white/90 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-hijau-800 to-hijau-900 rounded-[22px] p-8 text-white shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] relative overflow-hidden">
                  <div className="absolute -right-[60px] -bottom-[90px] w-[240px] h-[240px] rounded-full border border-white/9 pointer-events-none"></div>
                  <div className="text-[13.5px] text-white/70 font-semibold">Mulai Perencanaan Ibadah</div>
                  <p className="text-sm text-white/80 mt-2 max-w-md leading-relaxed">
                    Anda belum memiliki rencana tabungan aktif. Mari mulai menabung dan rencanakan perjalanan suci Umrah Anda sekarang!
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/tabungan")}
                    className="mt-6 px-5 py-3 rounded-xl text-[13.5px] font-bold bg-emas hover:bg-emas-deep text-hijau-900 flex items-center gap-2 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Mulai Menabung
                  </button>
                </div>
              )}
            </div>
 
            {/* Kolom Kanan: Informasi & Update + Kantor Pusat */}
            <div className="space-y-6">
              {/* Informasi & Update */}
              <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-[14.5px] text-teks-900 m-0">Informasi &amp; Update</h3>
                  <span
                    onClick={() => router.push("/dashboard/informasi")}
                    className="text-xs font-bold text-hijau-700 hover:text-hijau-900 cursor-pointer transition-colors"
                  >
                    Lihat semua
                  </span>
                </div>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {pengumumanList.length > 0 ? (
                    pengumumanList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => showPengumumanPopup(item)}
                        className="flex items-start gap-3 py-3 border-b border-garis last:border-b-0 cursor-pointer group"
                      >
                        <div className="w-2 h-2 rounded-full bg-hijau-700 mt-1.5 shrink-0 group-hover:scale-125 transition-transform"></div>
                        <div className="flex-1 text-left">
                          <h4 className="text-[13px] font-bold text-teks-900 group-hover:text-hijau-900 transition-colors leading-snug flex items-center justify-between gap-2">
                            <span className="truncate" title={item.judul}>
                              {item.judul}
                            </span>
                            {item.is_penting && (
                              <span className="badge inline-block bg-gradient-to-r from-emas to-[#E4C877] text-hijau-900 text-[8.5px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-[0_2px_8px_-1px_rgba(201,162,75,0.4)] border border-emas/30 shrink-0">
                                PENTING
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-teks-500 block mt-1">{formatSafeDate(item.created_at, { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-teks-300 text-sm">
                      Belum ada pengumuman terbaru.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Baris Bawah: Kantor Pusat & Tentang Kami Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mt-6">
            {/* Kantor Pusat Card */}
            <div className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-[14.5px] text-teks-900 m-0">Kantor Pusat</h3>
                  <a
                    href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-hijau-700 hover:text-hijau-900 transition-colors"
                  >
                    Buka di Maps
                  </a>
                </div>
                <div className="text-[12.5px] text-teks-500 mb-4 leading-relaxed text-left">
                  <strong className="block text-teks-900 text-[13px] mb-1">PT Madinah Salam Wisata</strong>
                  Jl. Radar Auri No.9, RT.13/RW.5, Cibubur, Kec. Ciracas, Jakarta Timur 13720
                </div>
              </div>
              <div className="h-[140px] rounded-xl overflow-hidden border border-garis bg-gradient-to-br from-hijau-100 to-[#F1EEE3] relative flex items-center justify-center shrink-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.234149021953!2d106.87784017551061!3d-6.363715693626297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed28f29cddad%3A0xe67098e727931cba!2sMadinah%20Salam%20Wisata!5e0!3m2!1sid!2sid!4v1709123456789!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  className="absolute inset-0 filter saturate-150 contrast-125"
                ></iframe>
              </div>
            </div>

            {/* Tentang Kami Card */}
            <div 
              onClick={() => router.push("/dashboard/tentang-kami")}
              className="bg-white border border-garis rounded-[22px] p-6 shadow-[0_14px_34px_-18px_rgba(11,61,48,0.20)] flex flex-col justify-between h-full cursor-pointer hover:bg-slate-50 transition-all duration-200"
            >
              <div>
                <h3 className="font-display font-semibold text-[14.5px] text-teks-900 mb-3">Tentang Kami</h3>
                <p className="text-[12.5px] text-teks-500 leading-relaxed m-0 text-left">
                  PT Madinah Salam Wisata melayani perjalanan Umrah &amp; Haji yang amanah, profesional, dan sesuai tuntunan syariat. Kami siap membimbing dan mengawal perjalanan suci Anda menuju tanah suci dengan pelayanan berkualitas.
                </p>
              </div>
              <div className="bg-hijau-900 text-white rounded-xl px-5 py-4 text-[11px] font-semibold text-center shadow-md select-none shrink-0 mt-6">
                <span className="text-[10px] opacity-75 uppercase tracking-wider block">IZIN PPIU NO</span>
                <b className="text-sm font-bold block mt-1 tracking-wider text-emas">03012400173490004</b>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View (Banking/E-Wallet Style) */}
        <div className="md:hidden space-y-6">
          {/* Welcome Message & Kartu Saldo */}
          <div className="bg-gradient-to-br from-hijau-900 to-hijau-800 rounded-3xl p-5 text-white shadow-[0_10px_28px_-14px_rgba(11,61,48,0.28)] relative overflow-hidden">
            {/* Background design circle */}
            <div className="absolute -right-10 -bottom-14 w-40 h-40 rounded-full border border-white/5 pointer-events-none"></div>
            
            <div className="text-xs text-white/70 font-medium">
              Assalamu&apos;alaikum, {userNama}
            </div>
            
            {savingsPlans.length > 0 ? (
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 -mx-5 px-5 pb-2">
                {savingsPlans.map((plan) => (
                  <div key={plan.idRencana} className="min-w-full snap-center flex-shrink-0">
                    <div className="text-xs text-white/60 mt-3 line-clamp-1 truncate">{plan.namaPaket}</div>
                    <div className="text-2xl font-bold font-serif mt-1 flex items-baseline gap-1.5 flex-wrap">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.totalTerkumpul)}
                      <span className="text-xs text-white/50 font-sans font-medium">/ {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.targetBiaya)}</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emas to-yellow-300 rounded-full" style={{ width: `${plan.percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/60 mt-2">
                        <span>Terkumpul <b>{plan.percentage}%</b></span>
                        <span>Target {plan.formattedTargetDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <button 
                        onClick={() => handleBayar(plan.idRencana, plan.cicilanKe)}
                        disabled={isPaying === plan.idRencana}
                        className="flex-1 py-2.5 bg-emas hover:bg-emas/90 text-hijau-900 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                      >
                        {isPaying === plan.idRencana ? "Proses..." : (
                          <>
                            <svg className="w-4 h-4 stroke-hijau-900" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Setor
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => { setIsNavigatingRiwayat(plan.idRencana); router.push(`/dashboard/tabungan/${plan.idRencana}/riwayat`); }}
                        disabled={isNavigatingRiwayat === plan.idRencana}
                        className="flex-1 py-2.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                      >
                        {isNavigatingRiwayat === plan.idRencana ? "Proses..." : (
                          <>
                            <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Riwayat
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-sm font-semibold mt-4 text-white/90">Mulai Perencanaan Ibadah Anda</div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Rencanakan tabungan Umrah atau Haji Anda sekarang untuk kemudahan perjalanan ke tanah suci.
                </p>
                <div className="mt-5">
                  <Link href="/dashboard/tabungan/baru" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emas hover:bg-emas/90 text-hijau-900 text-xs font-bold rounded-xl shadow-md active:scale-98 transition-all">
                    Mulai Menabung
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Quick Menu Grid */}
          <div>
            <div className="text-xs uppercase tracking-wider text-teks-500 font-bold mb-3">Menu Utama</div>
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              <Link href="/dashboard/tabungan" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Setor<br/>Tabungan</span>
              </Link>
              <Link href="/dashboard/paket" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a2 2 0 0 0-2.83 0L9 13.17V19h5.83l8.58-8.59a2 2 0 0 0 0-2.83z" /><path d="M16 5.5 18.5 8" /><path d="M3 21h9" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Paket<br/>Umrah</span>
              </Link>
              <Link href="/dashboard/riwayat-tabungan" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Riwayat<br/>Tabungan</span>
              </Link>
              <Link href="/dashboard/syarat-ketentuan" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Syarat &amp;<br/>Ketentuan</span>
              </Link>
              <Link href="/dashboard/riwayat" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l3 3" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Riwayat<br/>Transaksi</span>
              </Link>
              <Link href="/dashboard/tentang-kami" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Tentang<br/>Kami</span>
              </Link>
            </div>
          </div>

          {/* Informasi & Update Carousel */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs uppercase tracking-wider text-teks-500 font-bold">Informasi &amp; Update</div>
              <Link href="/dashboard/informasi" className="text-xs font-bold text-hijau-700">Lihat semua</Link>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x snap-mandatory scrollbar-none -mx-4 px-4">
              {pengumumanList.length > 0 ? (
                pengumumanList.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => showPengumumanPopup(item)}
                    className={`flex-shrink-0 w-[240px] rounded-2xl p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] cursor-pointer relative snap-start border ${
                      item.is_penting 
                        ? "bg-hijau-800 text-white border-hijau-700" 
                        : "bg-white text-teks-900 border-garis"
                    }`}
                  >
                    {item.is_penting && (
                      <span className="absolute top-4 right-4 bg-emas text-hijau-900 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Penting
                      </span>
                    )}
                    <div className={`text-[10px] flex items-center gap-1 mt-6 ${item.is_penting ? "text-white/60" : "text-teks-500"}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                      {formatSafeDate(item.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-sm font-bold mt-2 line-clamp-2 leading-snug">
                      {item.judul}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full bg-white border border-garis rounded-2xl p-6 text-center text-xs text-teks-500 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]">
                  Belum ada pengumuman terbaru.
                </div>
              )}
            </div>
          </div>

          {/* Tentang Kami Ringkas Card */}
          <div className="bg-white border border-garis rounded-2xl p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-hijau-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm font-serif text-teks-900">Tentang Kami</h3>
                <p className="text-xs text-teks-500 mt-1 leading-relaxed">
                  PT Madinah Salam Wisata melayani perjalanan Umrah &amp; Haji yang amanah, profesional, dan sesuai tuntunan syariat.
                </p>
                <Link href="/dashboard/tentang-kami" className="inline-flex items-center gap-1 text-xs font-bold text-hijau-700 mt-3">
                  Selengkapnya termasuk Visi &amp; Misi
                  <svg className="w-3 h-3 stroke-hijau-700" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Link>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-garis flex justify-between items-center text-[10px] text-teks-300">
              <span>Izin PPIU</span>
              <b className="text-teks-500 font-bold">03012400173490004</b>
            </div>
          </div>

          <Link href="/dashboard/lokasi" className="bg-white border border-garis rounded-2xl p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-hijau-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-teks-900">Kantor Pusat</div>
              <div className="text-[10px] text-teks-500 truncate mt-0.5">Jl. Radar Auri No.9, Cibubur, Jakarta Timur</div>
            </div>
            <svg className="w-4 h-4 stroke-teks-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </Link>
        </div>

      </div>
      
      {/* Custom styles for scrollbar inside the glassmorphism component */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
    </div>
  );
}
