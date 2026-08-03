"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccordionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function SyaratKetentuanClient() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string>("pendaftaran");

  const [settings, setSettings] = useState<Record<string, string>>({
    syarat_ketentuan_pendaftaran: "Paspor minimal berlaku satu tahun dan nama minimal 2 suku kata.\nSoft copy KTP (PDF, PNG, atau JPG).\nSoft copy pas foto 4x6 (JPG atau PNG).\nSoft copy KK bagi anak di bawah umur. (PDF, PNG, atau JPG).\nSoft copy buku kuning vaksin/sertifikat vaksin meningitis dan polio asli (PDF, PNG, atau JPG).\nDP Rp6.000.000.\nPelunasan maksimal 1 bulan sebelum keberangkatan.",
    syarat_ketentuan_pembatalan: "A. Uang Muka (DP)\nDP yang telah diserahkan oleh calon jamaah umroh tidak bisa dikembalikan.\n\nB. Pelunasan\nCalon jamaah wajib melakukan pelunasan selambat-lambatnya H-30.\n\nC. Pembatalan\n- Pembatalan diatas 30 hari sebelum keberangkatan maka dikenakan pemotongan administrasi Rp 6.000.000.\n- Pembatalan 30 hari sebelum keberangkatan maka dikenakan pemotongan 50% dari harga paket.\n- Pembatalan 15 hari sebelum keberangkatan maka dikenakan pemotongan 100% dari harga paket.\n- Pembatalan otomatis: Apabila calon jamaah tidak melunasi H-25, maka dianggap mengundurkan diri.",
    syarat_ketentuan_khusus: "1. Klausul Force Majeure\nDalam hal terjadi keadaan kahar (force majeure) yang berada di luar kemampuan dan kendali Para Pihak, maka Pihak Travel dibebaskan dari segala tuntutan atas kerugian atau keterlambatan.\n\n2. Klausul Penyesuaian Harga\nPihak Travel berhak melakukan penyesuaian harga paket apabila terjadi kenaikan biaya dari pihak ketiga, seperti kenaikan harga tiket penerbangan maskapai.",
    syarat_ketentuan_pembayaran: "Pembayaran dapat dilakukan melalui transfer ke rekening resmi atau pembayaran di kantor secara langsung.",
    syarat_ketentuan_perlengkapan: "Koper, tas paspor, seragam batik, buku panduan, ID card, mukena (untuk wanita), dan kain ihram (untuk laki-laki)."
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

  const pendaftaranList = settings.syarat_ketentuan_pendaftaran
    ? settings.syarat_ketentuan_pendaftaran.split("\n").filter(line => line.trim() !== "")
    : [];

  const items: AccordionItem[] = [
    {
      id: "pendaftaran",
      title: "Syarat & Ketentuan Pendaftaran",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed text-white">
          {pendaftaranList.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      )
    },
    {
      id: "pembatalan",
      title: "Syarat & Ketentuan Pembatalan",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      content: (
        <div className="text-xs text-white leading-relaxed space-y-4 whitespace-pre-wrap">
          {settings.syarat_ketentuan_pembatalan}
        </div>
      )
    },
    {
      id: "ketentuan-khusus",
      title: "Ketentuan Khusus",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      content: (
        <div className="text-xs text-white leading-relaxed space-y-4 whitespace-pre-wrap">
          {settings.syarat_ketentuan_khusus}
        </div>
      )
    },
    {
      id: "alur-pembayaran",
      title: "Alur Pembayaran",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
      content: (
        <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
          {settings.syarat_ketentuan_pembayaran}
        </p>
      )
    },
    {
      id: "perlengkapan",
      title: "Perlengkapan yang Disediakan",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      content: (
        <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
          {settings.syarat_ketentuan_perlengkapan}
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="md:hidden bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Syarat &amp; Ketentuan Khusus</h1>
            <p className="text-emerald-50/80 text-[11px] font-medium mt-0.5">Informasi terkait pendaftaran dan lainnya</p>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="px-5 mt-6 space-y-3">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="overflow-hidden rounded-2xl bg-hijau-900 transition-all duration-300 shadow-sm border border-hijau-800 animate-in fade-in duration-300">
              <button
                onClick={() => setOpenId(isOpen ? "" : item.id)}
                className="w-full flex items-center justify-between p-4 bg-hijau-900 text-white font-bold text-sm"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-left">{item.title}</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="p-4 pt-0 text-white border-t border-hijau-800/50 mt-1">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
