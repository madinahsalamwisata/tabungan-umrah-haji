import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function LokasiPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Detail Alamat Card */}
      <div className="bg-white border border-garis rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-full bg-hijau-100 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 text-hijau-800" />
          </div>
          <div>
            <h3 className="font-bold text-base text-teks-900 font-serif">PT Madinah Salam Wisata</h3>
            <p className="text-xs text-teks-500 leading-relaxed mt-1">
              Jl. Radar Auri No.9, RT.13/RW.5, Cibubur, Kec. Ciracas,<br/>
              Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13720
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-3 border-t border-dashed border-garis">
          <div className="flex items-center gap-2.5 text-xs text-teks-900">
            <Phone className="w-4 h-4 text-teks-300" />
            <span>(+62) 822 1000 4644</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-teks-900">
            <Mail className="w-4 h-4 text-teks-300" />
            <span>info@madinahsalamwisata.com</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-teks-900">
            <Clock className="w-4 h-4 text-teks-300" />
            <span>Senin - Sabtu: 08:30 - 17:00</span>
          </div>
        </div>
      </div>

      {/* Embed Map Card */}
      <div className="bg-white border border-garis rounded-3xl overflow-hidden shadow-sm flex flex-col h-[320px]">
        <div className="px-5 py-3.5 border-b border-garis bg-krem/20">
          <h4 className="text-xs font-bold text-teks-900 uppercase tracking-wider">Peta Interaktif</h4>
        </div>
        <div className="flex-1 bg-krem relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.234149021953!2d106.87784017551061!3d-6.363715693626297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed28f29cddad%3A0xe67098e727931cba!2sMadinah%20Salam%20Wisata!5e0!3m2!1sid!2sid!4v1709123456789!5m2!1sid!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 filter saturate-150 contrast-125"
          ></iframe>
        </div>
      </div>

      {/* Fixed Action Button at Bottom of Screen */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-garis p-4 z-40">
        <a 
          href="https://maps.app.goo.gl/whYEBuoB6w5JJmBc8" 
          target="_blank" 
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 bg-hijau-800 hover:bg-hijau-900 rounded-2xl text-sm font-bold text-white transition-all shadow-md active:scale-98"
        >
          <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}
