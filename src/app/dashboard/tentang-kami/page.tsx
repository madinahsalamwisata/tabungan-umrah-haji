"use client";

import { useState, useEffect } from "react";
import { Info, CheckCircle2 } from "lucide-react";

export default function TentangKamiPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    tentang_kami_company_name: "PT Madinah Salam Wisata",
    tentang_kami_description: "Penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami berkomitmen memberikan pengalaman ibadah terbaik bagi jamaah.",
    tentang_kami_ppiu_no: "03012400173490004",
    tentang_kami_visi: "Menjadi penyelenggara perjalanan ibadah Umrah, Haji, dan wisata terpercaya yang berkomitmen menghadirkan layanan sesuai tuntunan sunnah Rasulullah ﷺ.",
    tentang_kami_misi: "Menyelenggarakan perjalanan ibadah Umrah dan Haji yang sesuai dengan tuntunan syariat dan sunnah.\nMemberikan pelayanan yang amanah, profesional, dan penuh kepedulian kepada jamaah.\nMembimbing jamaah secara ruhiyah dan teknis agar meraih ibadah yang sah, khusyuk, dan mabrur.\nMenghadirkan pengalaman berwisata yang edukatif, berkesan, dan memperkuat iman.\nMenjalin kemitraan yang transparan dan berkelanjutan dengan stakeholder lokal dan internasional."
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchSettings();
    const interval = setInterval(fetchSettings, 3000);
    return () => clearInterval(interval);
  }, []);

  const misiList = settings.tentang_kami_misi
    ? settings.tentang_kami_misi.split("\n").filter(line => line.trim() !== "")
    : [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Intro Card */}
      <div className="bg-gradient-to-br from-hijau-900 to-hijau-800 rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full border border-white/5 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Info className="w-6 h-6 text-emas" />
          </div>
          <h2 className="text-xl font-bold font-serif">{settings.tentang_kami_company_name}</h2>
        </div>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {settings.tentang_kami_description}
        </p>
        
        <div className="mt-6 inline-block bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 shadow-inner">
          <span className="text-[10px] text-white/60 block uppercase tracking-wider font-semibold">Izin PPIU No:</span>
          <span className="text-sm font-bold text-emas">{settings.tentang_kami_ppiu_no}</span>
        </div>
      </div>

      {/* Visi Card */}
      <div className="bg-white border border-garis rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-hijau-900 font-serif mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-hijau-800" />
          Visi Kami
        </h3>
        <p className="text-sm text-teks-900 leading-relaxed italic bg-krem/40 p-4 rounded-2xl border border-garis/55 whitespace-pre-wrap">
          &quot;{settings.tentang_kami_visi}&quot;
        </p>
      </div>

      {/* Misi Card */}
      <div className="bg-white border border-garis rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-hijau-900 font-serif mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-hijau-800" />
          Misi Kami
        </h3>
        <ul className="space-y-3.5">
          {misiList.map((misi, idx) => (
            <li key={idx} className="flex gap-3 items-start animate-in fade-in duration-300">
              <span className="w-5 h-5 rounded-full bg-hijau-100 flex items-center justify-center text-[11px] font-bold text-hijau-900 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-gray-700 leading-relaxed">{misi}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
