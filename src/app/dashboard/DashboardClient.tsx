"use client";
import { useState, useEffect } from "react";
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
  savingsInfo = null
}: { 
  initialPengumuman: any[];
  userNama?: string;
  savingsInfo?: {
    namaPaket: string;
    totalTerkumpul: number;
    targetBiaya: number;
    percentage: number;
    formattedTargetDate: string;
    idRencana: string;
  } | null;
}) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>(initialPengumuman);

  useEffect(() => {
    const fetchPengumuman = () => {
      fetch("/api/admin/pengumuman")
        .then(res => res.json())
        .then(data => setPengumumanList(data))
        .catch(err => console.error("Gagal load pengumuman", err));
    };

    // Panggil pertama kali
    fetchPengumuman();

    // Polling setiap 3 detik (3000 ms)
    const interval = setInterval(fetchPengumuman, 3000);

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
      title: item.judul,
      html: `
        <div class="text-xs text-emerald-800 mb-4 pb-3 border-b border-gray-200 text-left flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ${new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
          ${item.is_penting ? '<span class="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Penting</span>' : ''}
        </div>
        <div class="text-sm text-gray-700 text-left whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto" style="scrollbar-width: thin;">
          ${item.konten}
        </div>
      `,
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#111827',
      backdrop: 'rgba(0,0,0,0.6)',
      confirmButtonColor: '#059669',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'rounded-3xl border border-gray-200 shadow-2xl backdrop-blur-xl',
        title: 'text-left text-xl text-emerald-800 font-bold',
        htmlContainer: 'text-left !m-0 !mt-2',
        confirmButton: 'rounded-xl shadow-lg hover:shadow-emerald-900/50 transition-all font-bold px-8'
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Kolom Kiri: Header + Tentang Kami + Visi Misi */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 flex flex-col">
            
            {/* Header Welcome Card */}
            <GlassCard className="bg-gradient-to-br from-emerald-50/90 to-white/90 border-emerald-200">
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">Ahlan wa Sahlan!</h1>
              <p className="text-gray-700 text-sm md:text-base">
                Selamat datang di sistem tabungan Umrah dan Haji Madinah Salam Wisata. Kami siap mendampingi perjalanan ibadah Anda.
              </p>
            </GlassCard>

            {/* Tentang Kami & Visi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1">
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-emerald-800 w-6 h-6" />
                  <h2 className="text-lg font-bold text-emerald-900">Tentang Kami</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm flex-1">
                  PT Madinah Salam Wisata adalah penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami berkomitmen memberikan pengalaman ibadah terbaik bagi jamaah.
                </p>
                <div className="mt-5 inline-block bg-emerald-950 border border-emerald-800 rounded-lg px-4 py-2 w-max shadow-inner">
                  <span className="text-[11px] text-emerald-100 block uppercase tracking-wider">Izin PPIU No:</span>
                  <span className="text-sm font-bold text-white">03012400173490004</span>
                </div>
              </GlassCard>

              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="text-emerald-800 w-6 h-6" />
                  <h2 className="text-lg font-bold text-emerald-900">Visi Kami</h2>
                </div>
                <p className="text-sm text-gray-700 italic leading-relaxed flex-1">
                  &quot;Menjadi penyelenggara perjalanan ibadah Umrah, Haji, dan wisata terpercaya yang berkomitmen menghadirkan layanan sesuai tuntunan sunnah Rasulullah ﷺ.&quot;
                </p>
              </GlassCard>
            </div>

            {/* Misi */}
            <GlassCard>
              <h2 className="text-lg font-bold text-emerald-900 mb-4">Misi Kami</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700">
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span>Menyelenggarakan perjalanan ibadah Umrah dan Haji sesuai syariat dan sunnah.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span>Memberikan pelayanan yang amanah, profesional, dan penuh kepedulian.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span>Membimbing jamaah agar meraih ibadah yang sah, khusyuk, dan mabrur.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span>Menghadirkan pengalaman berwisata yang edukatif dan memperkuat iman.</span>
                </li>
              </ul>
            </GlassCard>

          </div>

          {/* Kolom Kanan: Pengumuman / Notifications */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full min-h-[450px] flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="text-emerald-800 w-6 h-6 animate-pulse" />
                <h2 className="text-lg font-bold text-emerald-900">Informasi & Update</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 custom-scrollbar">
                {pengumumanList.length > 0 ? (
                  pengumumanList.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => showPengumumanPopup(item)}
                      className={`w-full text-left relative p-3 sm:p-4 rounded-xl border transition-all hover:shadow-lg cursor-pointer hover:-translate-y-0.5 ${
                        item.is_penting 
                          ? "bg-emerald-950 border-emerald-800 hover:bg-emerald-900" 
                          : "bg-emerald-950 border-emerald-800 hover:bg-emerald-900"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className={`font-bold text-sm leading-tight ${item.is_penting ? "text-white" : "text-white"}`}>
                            {item.judul}
                          </h3>
                          {item.is_penting && (
                            <span className="bg-yellow-500 text-yellow-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm">
                              Penting
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium uppercase tracking-wide flex items-center gap-1 ${item.is_penting ? "text-emerald-100" : "text-emerald-100"}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center h-full text-emerald-200 bg-emerald-950 rounded-xl border border-emerald-800">
                    <Bell className="w-8 h-8 text-emerald-500/50 mb-3" />
                    <span className="text-sm">Belum ada pengumuman terbaru saat ini.</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Baris Bawah: Accordion dan Maps */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Accordion */}
            <GlassCard>
              <h2 className="text-lg font-bold text-emerald-900 mb-6">Informasi & Ketentuan Penting</h2>
              
              <div className="space-y-3">
                {/* Accordion 1: Syarat & Ketentuan Pendaftaran */}
                <div className="border border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-950 shadow-sm transition-all hover:bg-emerald-900">
                  <button 
                    onClick={() => toggleAccordion('syarat_daftar')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-white" />
                      <span className="font-bold text-sm text-white">Syarat & Ketentuan Pendaftaran</span>
                    </div>
                    {openAccordion === 'syarat_daftar' ? <ChevronUp className="text-emerald-200 w-5 h-5" /> : <ChevronDown className="text-emerald-200 w-5 h-5" />}
                  </button>
                  {openAccordion === 'syarat_daftar' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-emerald-100 border-t border-emerald-700/50">
                      <ul className="list-disc pl-4 space-y-1.5 mt-2">
                        <li>Paspor minimal berlaku satu tahun dan nama minimal 2 suku kata.</li>
                        <li>Soft copy KTP (PDF, PNG, atau JPG).</li>
                        <li>Soft copy pas foto 4x6 (JPG atau PNG).</li>
                        <li>Soft copy KK bagi anak di bawah umur. (PDF, PNG, atau JPG).</li>
                        <li>Soft copy buku kuning vaksin/sertifikat vaksin meningitis dan polio asli (PDF, PNG, atau JPG).</li>
                        <li>DP Rp6.000.000.</li>
                        <li>Pelunasan maksimal 1 bulan sebelum keberangkatan.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Syarat & Ketentuan Pembatalan */}
                <div className="border border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-950 shadow-sm transition-all hover:bg-emerald-900">
                  <button 
                    onClick={() => toggleAccordion('syarat_batal')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-white" />
                      <span className="font-bold text-sm text-white">Syarat & Ketentuan Pembatalan</span>
                    </div>
                    {openAccordion === 'syarat_batal' ? <ChevronUp className="text-emerald-200 w-5 h-5" /> : <ChevronDown className="text-emerald-200 w-5 h-5" />}
                  </button>
                  {openAccordion === 'syarat_batal' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-emerald-100 border-t border-emerald-700/50 space-y-3 mt-2">
                      <div>
                        <strong className="text-white block mb-0.5">A. Uang Muka (DP)</strong>
                        <p>DP yang telah diserahkan oleh calon jamaah umroh tidak bisa dikembalikan.</p>
                      </div>
                      <div>
                        <strong className="text-white block mb-0.5">B. Pelunasan</strong>
                        <ul className="list-disc pl-4">
                          <li>Calon jamaah wajib melakukan pelunasan selambat-lambatnya H-30.</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-white block mb-0.5">C. Pembatalan</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Pembatalan diatas 30 hari sebelum keberangkatan maka dikenakan pemotongan administrasi Rp 6.000.000.</li>
                          <li>Pembatalan 30 hari sebelum keberangkatan maka dikenakan pemotongan 50% dari harga paket.</li>
                          <li>Pembatalan 15 hari sebelum keberangkatan maka dikenakan pemotongan 100% dari harga paket.</li>
                          <li><strong>Pembatalan otomatis:</strong> Apabila calon jamaah tidak melunasi H-25, maka dianggap mengundurkan diri.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Ketentuan Khusus */}
                <div className="border border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-950 shadow-sm transition-all hover:bg-emerald-900">
                  <button 
                    onClick={() => toggleAccordion('ketentuan_khusus')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-white" />
                      <span className="font-bold text-sm text-white">Ketentuan Khusus</span>
                    </div>
                    {openAccordion === 'ketentuan_khusus' ? <ChevronUp className="text-emerald-200 w-5 h-5" /> : <ChevronDown className="text-emerald-200 w-5 h-5" />}
                  </button>
                  {openAccordion === 'ketentuan_khusus' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-emerald-100 border-t border-emerald-700/50 space-y-3 mt-2">
                      <div>
                        <strong className="text-white block mb-0.5">1. Klausul Force Majeure</strong>
                        <p>Dalam hal terjadi keadaan kahar (force majeure) yang berada di luar kemampuan dan kendali Para Pihak, maka Pihak Travel dibebaskan dari segala tuntutan atas kerugian atau keterlambatan.</p>
                      </div>
                      <div>
                        <strong className="text-white block mb-0.5">2. Klausul Penyesuaian Harga</strong>
                        <p>Pihak Travel berhak melakukan penyesuaian harga paket apabila terjadi kenaikan biaya dari pihak ketiga, seperti kenaikan harga tiket penerbangan maskapai.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 4: Alur Pembayaran */}
                <div className="border border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-950 shadow-sm transition-all hover:bg-emerald-900">
                  <button 
                    onClick={() => toggleAccordion('alur_bayar')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-white" />
                      <span className="font-bold text-sm text-white">Alur Pembayaran</span>
                    </div>
                    {openAccordion === 'alur_bayar' ? <ChevronUp className="text-emerald-200 w-5 h-5" /> : <ChevronDown className="text-emerald-200 w-5 h-5" />}
                  </button>
                  {openAccordion === 'alur_bayar' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-emerald-100 border-t border-emerald-700/50 mt-2">
                      <ul className="list-disc pl-4 space-y-1.5">
                        <li>Semua transaksi ditransfer ke rekening <strong>Bank Syariah Indonesia (BSI)</strong>.</li>
                        <li>Nomor Rekening: <strong className="text-yellow-400">727 889 1326</strong>.</li>
                        <li>Atas Nama: <strong>PT Madinah Salam Wisata</strong>.</li>
                        <li>Bukti transaksi wajib dikonfirmasi ke admin di nomor <strong>(+62) 822 1000 4644</strong>.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 5: Perlengkapan Umrah */}
                <div className="border border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-950 shadow-sm transition-all hover:bg-emerald-900">
                  <button 
                    onClick={() => toggleAccordion('perlengkapan')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-white" />
                      <span className="font-bold text-sm text-white">Perlengkapan yang Disediakan</span>
                    </div>
                    {openAccordion === 'perlengkapan' ? <ChevronUp className="text-emerald-200 w-5 h-5" /> : <ChevronDown className="text-emerald-200 w-5 h-5" />}
                  </button>
                  {openAccordion === 'perlengkapan' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-emerald-100 border-t border-emerald-700/50 mt-2">
                      <ul className="list-disc pl-4 space-y-1.5">
                        <li>Koper Bagasi 24 Inci &amp; Koper Kabin 18 Inci.</li>
                        <li>Kain Ihram Premium &amp; Sabuk (untuk laki-laki).</li>
                        <li>Jilbab Premium (untuk perempuan).</li>
                        <li>Tas Selempang, Tas Serut untuk Sendal.</li>
                        <li>Buku Doa, Buku Dzikir, Parfum, dan ID Card.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Map */}
            <GlassCard className="flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-emerald-800 w-6 h-6 animate-bounce" />
                    <h2 className="text-lg font-bold text-emerald-900">Lokasi Kantor</h2>
                  </div>
                  <p className="font-semibold text-emerald-800 mb-1 text-sm">PT Madinah Salam Wisata</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Jl. Radar Auri No.9, RT.13/RW.5, Cibubur, Kec. Ciracas,<br/>
                    Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13720
                  </p>
                </div>
                <a 
                  href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 transition-all shadow-sm"
                >
                  Buka Maps <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 shadow-inner bg-gray-100 min-h-[250px] relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.234149021953!2d106.87784017551061!3d-6.363715693626297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed28f29cddad%3A0xe67098e727931cba!2sMadinah%20Salam%20Wisata!5e0!3m2!1sid!2sid!4v1709123456789!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '250px' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 filter saturate-150 contrast-125"
                ></iframe>
              </div>
              <a 
                  href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="sm:hidden mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all shadow-md"
                >
                  Buka di Google Maps
              </a>
            </GlassCard>

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
            
            {savingsInfo ? (
              <>
                <div className="text-xs text-white/60 mt-3">Total Tabungan Umrah &amp; Haji</div>
                <div className="text-2xl font-bold font-serif mt-1 flex items-baseline gap-1.5 flex-wrap">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(savingsInfo.totalTerkumpul)}
                  <span className="text-xs text-white/50 font-sans font-medium">/ {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(savingsInfo.targetBiaya)}</span>
                </div>
                
                <div className="mt-4">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emas to-yellow-300 rounded-full" style={{ width: `${savingsInfo.percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/60 mt-2">
                    <span>Terkumpul <b>{savingsInfo.percentage}%</b></span>
                    <span>Target {savingsInfo.formattedTargetDate}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <Link href="/dashboard/tabungan" className="flex-1 py-2.5 bg-emas hover:bg-emas/90 text-hijau-900 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all">
                    <svg className="w-4 h-4 stroke-hijau-900" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Setor
                  </Link>
                  <Link href="/dashboard/tabungan" className="flex-1 py-2.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 active:scale-98 transition-all">
                    <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Riwayat
                  </Link>
                </div>
              </>
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
            <div className="grid grid-cols-4 gap-2">
              <Link href="/dashboard/tabungan/baru" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Setor<br/>Tabungan</span>
              </Link>
              <Link href="/dashboard/paket" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a2 2 0 0 0-2.83 0L9 13.17V19h5.83l8.58-8.59a2 2 0 0 0 0-2.83z" /><path d="M16 5.5 18.5 8" /><path d="M3 21h9" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Paket<br/>Umrah</span>
              </Link>
              <Link href="/dashboard/tabungan" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l3 3" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-teks-900 leading-tight">Riwayat<br/>Transaksi</span>
              </Link>
              <Link href="/dashboard/tentang-kami" className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-hijau-100 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 stroke-hijau-800" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
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
                    className={`flex-shrink-0 w-[240px] rounded-2xl p-4 shadow-sm cursor-pointer relative snap-start border ${
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
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-sm font-bold mt-2 line-clamp-2 leading-snug">
                      {item.judul}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full bg-white border border-garis rounded-2xl p-6 text-center text-xs text-teks-500">
                  Belum ada pengumuman terbaru.
                </div>
              )}
            </div>
          </div>

          {/* Tentang Kami Ringkas Card */}
          <div className="bg-white border border-garis rounded-2xl p-4 shadow-sm">
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

          <Link href="/dashboard/lokasi" className="bg-white border border-garis rounded-2xl p-4 shadow-sm flex items-center gap-3">
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
