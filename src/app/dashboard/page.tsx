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

// Helper component untuk kotak dengan background makkah + glassmorphism
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-xl ${className}`}>
    {/* Background Image Layer */}
    <div className="absolute inset-0 z-0">
      <img 
        src="/images/bg/makkah_thumbnail.webp" 
        alt="Background Makkah" 
        className="w-full h-full object-cover" 
      />
      {/* Dark & Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-emerald-950/80 to-black/90"></div>
      <div className="absolute inset-0 backdrop-blur-[4px] border border-white/10 rounded-2xl"></div>
    </div>
    
    {/* Content Layer */}
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
    <div className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="relative z-10 max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Beranda Dashboard</h1>
          <p className="mt-1 text-sm text-emerald-600">Selamat datang di sistem tabungan Umrah dan Haji Anda.</p>
        </div>

        {/* Section 1: Notifications (Dynamic from Database) */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-yellow-400 w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Informasi & Update</h2>
          </div>
          <div className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {pengumumanList.length > 0 ? (
              pengumumanList.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative p-4 rounded-xl border transition-all ${
                    item.is_penting 
                      ? "bg-yellow-900/20 border-yellow-500/30" 
                      : "bg-black/30 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${item.is_penting ? "text-yellow-400" : "text-white"}`}>
                        {item.judul}
                      </h3>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </span>
                      <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                        {item.konten}
                      </p>
                    </div>
                    {item.is_penting && (
                      <span className="bg-yellow-500 text-yellow-950 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider absolute top-4 right-4">
                        Penting
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 italic bg-black/20 rounded-xl border border-white/10">
                Belum ada pengumuman terbaru saat ini.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Section 2: About & Vision Mission */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-emerald-400 w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Tentang Kami</h2>
          </div>
          <p className="text-gray-200 leading-relaxed text-sm">
            PT Madinah Salam Wisata adalah penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami memiliki komitmen untuk memberikan pengalaman ibadah terbaik bagi jamaah.
          </p>
          <div className="mt-4 inline-block bg-black/40 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-400 block">Izin PPIU No:</span>
            <span className="text-sm font-bold text-emerald-400">03012400173490004</span>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">Visi & Misi</h2>
          
          <div className="mb-4">
            <h3 className="text-yellow-400 font-bold mb-2">Visi:</h3>
            <p className="text-sm text-gray-200 italic">
              &quot;Menjadi penyelenggara perjalanan ibadah Umrah, Haji, dan wisata terpercaya yang berkomitmen menghadirkan layanan sesuai tuntunan sunnah Rasulullah ﷺ.&quot;
            </p>
          </div>
          
          <div>
            <h3 className="text-yellow-400 font-bold mb-2">Misi:</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Menyelenggarakan perjalanan ibadah Umrah dan Haji yang sesuai dengan tuntunan syariat dan sunnah.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Memberikan pelayanan yang amanah, profesional, dan penuh kepedulian kepada jamaah.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Membimbing jamaah secara ruhiyah dan teknis agar meraih ibadah yang sah, khusyuk, dan mabrur.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Menghadirkan pengalaman berwisata yang edukatif, berkesan, dan memperkuat iman.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Menjalin kemitraan yang transparan dan berkelanjutan dengan stakeholder lokal dan internasional.</span>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Section 3: Information Accordion */}
        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-6">Informasi & Ketentuan Penting</h2>
          
          <div className="space-y-4">
            {/* Accordion 1: Syarat & Ketentuan Pendaftaran */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
              <button 
                onClick={() => toggleAccordion('syarat_daftar')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Syarat & Ketentuan Pendaftaran</span>
                </div>
                {openAccordion === 'syarat_daftar' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {openAccordion === 'syarat_daftar' && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-300 border-t border-white/10">
                  <ul className="list-disc pl-5 space-y-2">
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
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
              <button 
                onClick={() => toggleAccordion('syarat_batal')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Syarat & Ketentuan Pembatalan</span>
                </div>
                {openAccordion === 'syarat_batal' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {openAccordion === 'syarat_batal' && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-300 border-t border-white/10 space-y-4">
                  <div>
                    <strong className="text-white block mb-1">A. Uang Muka (DP)</strong>
                    <p>DP yang telah diserahkan oleh calon jamaah umroh tidak bisa dikembalikan.</p>
                  </div>
                  <div>
                    <strong className="text-white block mb-1">B. Pelunasan</strong>
                    <ul className="list-disc pl-5">
                      <li>Calon jamaah umroh wajib melakukan pelunasan selambat-lambatnya H - 30 sebelum keberangkatan.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-white block mb-1">C. Pembatalan</strong>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Pembatalan diatas 30 hari sebelum keberangkatan maka dikenakan pemotongan biaya administrasi sebesar Rp. 6.000.000 (enam juta rupiah).</li>
                      <li>Pembatalan 30 hari sebelum keberangkatan maka dikenakan pemotongan sebesar 50% dari harga paket.</li>
                      <li>Pembatalan 15 hari sebelum keberangkatan maka dikenakan pemotongan sebesar 100% dari harga paket.</li>
                      <li><strong>Pembatalan secara otomatis:</strong> Apabila calon jamaah tidak melakukan pelunasan H-25 sebelum keberangkatan setelah dilakukan konfirmasi oleh pihak travel maka calon jamaah dianggap mengundurkan diri.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-white block mb-1">D. Pengembalian Dana</strong>
                    <ul className="list-disc pl-5">
                      <li>Pengembalian Dana Jamaah yang mengundurkan diri atau membatalkan pendaftaran paling cepat adalah 7 hari setelah jamaah mengajukan surat pembatalan dan disetujui pihak travel.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Ketentuan Khusus */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
              <button 
                onClick={() => toggleAccordion('ketentuan_khusus')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Ketentuan Khusus</span>
                </div>
                {openAccordion === 'ketentuan_khusus' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {openAccordion === 'ketentuan_khusus' && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-300 border-t border-white/10 space-y-4">
                  <div>
                    <strong className="text-white block mb-1">1. Klausul Force Majeure</strong>
                    <p>Dalam hal terjadi keadaan kahar (force majeure) yang berada di luar kemampuan dan kendali Para Pihak, termasuk namun tidak terbatas pada bencana alam, perang, kebijakan pemerintah, wabah penyakit, gangguan transportasi, serta keadaan lain yang sejenis, maka Pihak Travel dibebaskan dari segala tuntutan dan tanggung jawab atas kerugian, keterlambatan, maupun kegagalan pelaksanaan layanan yang timbul akibat keadaan tersebut. Segala bentuk penyelesaian lebih lanjut akan diselesaikan secara musyawarah untuk mencapai mufakat oleh Para Pihak.</p>
                  </div>
                  <div>
                    <strong className="text-white block mb-1">2. Klausul Penyesuaian Harga</strong>
                    <p>Pihak Travel berhak melakukan penyesuaian harga paket perjalanan sewaktu-waktu apabila terjadi kenaikan biaya dari pihak ketiga, termasuk namun tidak terbatas pada kenaikan harga tiket penerbangan yang ditetapkan oleh maskapai penerbangan maupun perubahan biaya operasional lainnya yang berkaitan dengan pelaksanaan perjalanan.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Alur Pembayaran */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
              <button 
                onClick={() => toggleAccordion('alur_bayar')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Alur Pembayaran</span>
                </div>
                {openAccordion === 'alur_bayar' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {openAccordion === 'alur_bayar' && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-300 border-t border-white/10">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Semua transaksi ditransfer ke rekening <strong>Bank Syariah Indonesia (BSI)</strong>.</li>
                    <li>Nomor Rekening: <strong className="text-emerald-400">727 889 1326</strong>.</li>
                    <li>Atas Nama: <strong>PT Madinah Salam Wisata</strong>.</li>
                    <li>Bukti transaksi wajib dikonfirmasi ke admin di nomor <strong>(+62) 822 1000 4644</strong>.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 5: Perlengkapan Umrah */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm">
              <button 
                onClick={() => toggleAccordion('perlengkapan')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Perlengkapan Umrah yang Disediakan</span>
                </div>
                {openAccordion === 'perlengkapan' ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {openAccordion === 'perlengkapan' && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-300 border-t border-white/10">
                  <ul className="list-disc pl-5 space-y-2">
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

        {/* Section 4: Address and Map */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-red-400 w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Alamat Kantor Kami</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 text-gray-200">
              <p className="font-semibold text-white mb-2">PT Madinah Salam Wisata</p>
              <p className="text-sm leading-relaxed">
                Jl. Radar Auri No.9, RT.13/RW.5, <br/>
                Cibubur, Kec. Ciracas, <br/>
                Kota Jakarta Timur, <br/>
                Daerah Khusus Ibukota Jakarta 13720
              </p>
              <a 
                href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Buka di Google Maps
              </a>
            </div>
            
            <div className="md:col-span-2 h-64 md:h-auto rounded-xl overflow-hidden border border-white/20">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.234149021953!2d106.87784017551061!3d-6.363715693626297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed28f29cddad%3A0xe67098e727931cba!2sMadinah%20Salam%20Wisata!5e0!3m2!1sid!2sid!4v1709123456789!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '250px' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter brightness-90"
              ></iframe>
            </div>
          </div>
        </GlassCard>

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
