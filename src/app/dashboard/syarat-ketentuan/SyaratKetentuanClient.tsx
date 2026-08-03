"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccordionItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export default function SyaratKetentuanClient() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string>("");

  const [settings, setSettings] = useState<Record<string, string>>({
    syarat_ketentuan_sections: "[]"
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

  let sections: Array<{ id: string; title: string; content: string; isList?: boolean }> = [];
  try {
    sections = JSON.parse(settings.syarat_ketentuan_sections || "[]");
  } catch (err) {
    console.error("Error parsing syarat ketentuan sections:", err);
  }

  // Set the first open accordion on mount once data is loaded
  useEffect(() => {
    if (sections.length > 0 && !openId) {
      setOpenId(sections[0].id || "0");
    }
  }, [settings.syarat_ketentuan_sections]);

  // Icons array map to make default icons look gorgeous
  const getIcon = (id: string, idx: number) => {
    if (id === "pendaftaran") {
      return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
    if (id === "pembatalan") {
      return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
    if (id === "ketentuan-khusus") {
      return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
    if (id === "alur-pembayaran") {
      return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    }
    if (id === "perlengkapan") {
      return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    }
    // Default dynamic document icon for additional custom sections
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 text-left">
      {/* Header */}
      <div className="md:hidden bg-gradient-to-b from-hijau-900 to-hijau-800 pt-6 pb-5 px-5 sticky top-0 z-20 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Syarat &amp; Ketentuan Khusus</h1>
            <p className="text-emerald-50/80 text-[11px] font-medium mt-0.5">Informasi terkait pendaftaran and lainnya</p>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="px-5 mt-6 space-y-3">
        {sections.map((item, idx) => {
          const id = item.id || String(idx);
          const isOpen = openId === id;
          const isList = item.isList;
          const listItems = isList
            ? item.content.split("\n").filter(line => line.trim() !== "")
            : [];

          return (
            <div key={id} className="overflow-hidden rounded-2xl bg-hijau-900 transition-all duration-300 shadow-sm border border-hijau-800 animate-in fade-in duration-300">
              <button
                onClick={() => setOpenId(isOpen ? "" : id)}
                className="w-full flex items-center justify-between p-4 bg-hijau-900 text-white font-bold text-sm"
              >
                <div className="flex items-center gap-3">
                  {getIcon(item.id, idx)}
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
                className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="p-4 pt-0 text-white border-t border-hijau-800/50 mt-1">
                  {isList ? (
                    <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed text-white">
                      {listItems.map((line, lineIdx) => (
                        <li key={lineIdx}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
