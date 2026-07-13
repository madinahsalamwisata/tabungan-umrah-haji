"use client";
import { useState, useEffect } from "react";
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

// Helper component untuk kotak glassmorphism murni
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 ${className}`}>
    <div className="relative z-10 p-6">
      {children}
    </div>
  </div>
);

export default function DashboardPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);

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

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Header + Tentang Kami + Visi Misi */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Header Welcome Card */}
            <GlassCard className="bg-gradient-to-br from-emerald-900/60 to-black/40 border-emerald-500/30">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Ahlan wa Sahlan!</h1>
              <p className="text-emerald-100/90 text-sm md:text-base drop-shadow-md">
                Selamat datang di sistem tabungan Umrah dan Haji Madinah Salam Wisata. Kami siap mendampingi perjalanan ibadah Anda.
              </p>
            </GlassCard>

            {/* Tentang Kami & Visi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-emerald-400 w-6 h-6" />
                  <h2 className="text-lg font-bold text-white">Tentang Kami</h2>
                </div>
                <p className="text-gray-200 leading-relaxed text-sm flex-1">
                  PT Madinah Salam Wisata adalah penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami berkomitmen memberikan pengalaman ibadah terbaik bagi jamaah.
                </p>
                <div className="mt-5 inline-block bg-black/40 border border-white/10 rounded-lg px-4 py-2 w-max shadow-inner">
                  <span className="text-[11px] text-gray-400 block uppercase tracking-wider">Izin PPIU No:</span>
                  <span className="text-sm font-bold text-emerald-400">03012400173490004</span>
                </div>
              </GlassCard>

              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="text-yellow-400 w-6 h-6" />
                  <h2 className="text-lg font-bold text-white">Visi Kami</h2>
                </div>
                <p className="text-sm text-gray-200 italic leading-relaxed flex-1">
                  &quot;Menjadi penyelenggara perjalanan ibadah Umrah, Haji, dan wisata terpercaya yang berkomitmen menghadirkan layanan sesuai tuntunan sunnah Rasulullah ﷺ.&quot;
                </p>
              </GlassCard>
            </div>

            {/* Misi */}
            <GlassCard>
              <h2 className="text-lg font-bold text-white mb-4">Misi Kami</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-200">
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Menyelenggarakan perjalanan ibadah Umrah dan Haji sesuai syariat dan sunnah.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Memberikan pelayanan yang amanah, profesional, dan penuh kepedulian.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Membimbing jamaah agar meraih ibadah yang sah, khusyuk, dan mabrur.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Menghadirkan pengalaman berwisata yang edukatif dan memperkuat iman.</span>
                </li>
              </ul>
            </GlassCard>

          </div>

          {/* Kolom Kanan: Pengumuman / Notifications */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full min-h-[450px] flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="text-yellow-400 w-6 h-6 animate-pulse" />
                <h2 className="text-lg font-bold text-white">Informasi & Update</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {pengumumanList.length > 0 ? (
                  pengumumanList.map((item) => (
                    <div 
                      key={item.id} 
                      className={`relative p-4 rounded-xl border transition-all hover:shadow-lg ${
                        item.is_penting 
                          ? "bg-gradient-to-br from-yellow-900/30 to-black/30 border-yellow-500/40" 
                          : "bg-black/30 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className={`font-bold text-sm leading-tight ${item.is_penting ? "text-yellow-400 drop-shadow-sm" : "text-emerald-100"}`}>
                            {item.judul}
                          </h3>
                          {item.is_penting && (
                            <span className="bg-yellow-500 text-yellow-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm">
                              Penting
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed border-t border-white/10 pt-2">
                          {item.konten}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center h-full text-gray-400 bg-black/20 rounded-xl border border-white/10">
                    <Bell className="w-8 h-8 text-white/20 mb-3" />
                    <span className="text-sm">Belum ada pengumuman terbaru saat ini.</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Baris Bawah: Accordion dan Maps */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Accordion */}
            <GlassCard>
              <h2 className="text-lg font-bold text-white mb-6">Informasi & Ketentuan Penting</h2>
              
              <div className="space-y-3">
                {/* Accordion 1: Syarat & Ketentuan Pendaftaran */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-sm transition-all hover:bg-black/40">
                  <button 
                    onClick={() => toggleAccordion('syarat_daftar')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-white drop-shadow-sm">Syarat & Ketentuan Pendaftaran</span>
                    </div>
                    {openAccordion === 'syarat_daftar' ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                  </button>
                  {openAccordion === 'syarat_daftar' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-gray-300 border-t border-white/10">
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
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-sm transition-all hover:bg-black/40">
                  <button 
                    onClick={() => toggleAccordion('syarat_batal')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-white drop-shadow-sm">Syarat & Ketentuan Pembatalan</span>
                    </div>
                    {openAccordion === 'syarat_batal' ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                  </button>
                  {openAccordion === 'syarat_batal' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-gray-300 border-t border-white/10 space-y-3 mt-2">
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
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-sm transition-all hover:bg-black/40">
                  <button 
                    onClick={() => toggleAccordion('ketentuan_khusus')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-white drop-shadow-sm">Ketentuan Khusus</span>
                    </div>
                    {openAccordion === 'ketentuan_khusus' ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                  </button>
                  {openAccordion === 'ketentuan_khusus' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-gray-300 border-t border-white/10 space-y-3 mt-2">
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
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-sm transition-all hover:bg-black/40">
                  <button 
                    onClick={() => toggleAccordion('alur_bayar')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-white drop-shadow-sm">Alur Pembayaran</span>
                    </div>
                    {openAccordion === 'alur_bayar' ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                  </button>
                  {openAccordion === 'alur_bayar' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-gray-300 border-t border-white/10 mt-2">
                      <ul className="list-disc pl-4 space-y-1.5">
                        <li>Semua transaksi ditransfer ke rekening <strong>Bank Syariah Indonesia (BSI)</strong>.</li>
                        <li>Nomor Rekening: <strong className="text-emerald-400">727 889 1326</strong>.</li>
                        <li>Atas Nama: <strong>PT Madinah Salam Wisata</strong>.</li>
                        <li>Bukti transaksi wajib dikonfirmasi ke admin di nomor <strong>(+62) 822 1000 4644</strong>.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 5: Perlengkapan Umrah */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-sm transition-all hover:bg-black/40">
                  <button 
                    onClick={() => toggleAccordion('perlengkapan')}
                    className="w-full px-5 py-3.5 flex justify-between items-center transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-white drop-shadow-sm">Perlengkapan yang Disediakan</span>
                    </div>
                    {openAccordion === 'perlengkapan' ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                  </button>
                  {openAccordion === 'perlengkapan' && (
                    <div className="px-5 pb-4 pt-1 text-xs text-gray-300 border-t border-white/10 mt-2">
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
                    <MapPin className="text-red-400 w-6 h-6 animate-bounce" />
                    <h2 className="text-lg font-bold text-white drop-shadow-sm">Lokasi Kantor</h2>
                  </div>
                  <p className="font-semibold text-emerald-300 mb-1 text-sm">PT Madinah Salam Wisata</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Jl. Radar Auri No.9, RT.13/RW.5, Cibubur, Kec. Ciracas,<br/>
                    Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13720
                  </p>
                </div>
                <a 
                  href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-emerald-300 transition-all shadow-sm"
                >
                  Buka Maps <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 shadow-inner bg-black/20 min-h-[250px] relative">
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
