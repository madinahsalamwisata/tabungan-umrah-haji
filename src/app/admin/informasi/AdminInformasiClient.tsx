"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface InfoSection {
  id: string;
  title: string;
  content: string;
  isList?: boolean;
}

export default function AdminInformasiClient() {
  const [activeTab, setActiveTab] = useState<"tentang" | "syarat">("tentang");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [ppiuNo, setPpiuNo] = useState("");

  const [tentangSections, setTentangSections] = useState<InfoSection[]>([]);
  const [syaratSections, setSyaratSections] = useState<InfoSection[]>([]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setCompanyName(data.tentang_kami_company_name || "");
          setDescription(data.tentang_kami_description || "");
          setPpiuNo(data.tentang_kami_ppiu_no || "");

          try {
            setTentangSections(JSON.parse(data.tentang_kami_sections || "[]"));
          } catch (e) {
            console.error("Error parsing tentang kami sections", e);
          }

          try {
            setSyaratSections(JSON.parse(data.syarat_ketentuan_sections || "[]"));
          } catch (e) {
            console.error("Error parsing syarat ketentuan sections", e);
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Handlers for dynamic sections (Tentang Kami)
  const addTentangSection = () => {
    const newSec: InfoSection = {
      id: "sec_" + Date.now(),
      title: "Seksi Baru",
      content: "",
      isList: false
    };
    setTentangSections([...tentangSections, newSec]);
  };

  const updateTentangSection = (index: number, fields: Partial<InfoSection>) => {
    const updated = [...tentangSections];
    updated[index] = { ...updated[index], ...fields };
    setTentangSections(updated);
  };

  const deleteTentangSection = (index: number) => {
    const updated = tentangSections.filter((_, i) => i !== index);
    setTentangSections(updated);
  };

  const moveTentangSection = (index: number, direction: "up" | "down") => {
    const updated = [...tentangSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTentangSections(updated);
  };

  // Handlers for dynamic sections (Syarat & Ketentuan)
  const addSyaratSection = () => {
    const newSec: InfoSection = {
      id: "sec_" + Date.now(),
      title: "Syarat & Ketentuan Baru",
      content: "",
      isList: false
    };
    setSyaratSections([...syaratSections, newSec]);
  };

  const updateSyaratSection = (index: number, fields: Partial<InfoSection>) => {
    const updated = [...syaratSections];
    updated[index] = { ...updated[index], ...fields };
    setSyaratSections(updated);
  };

  const deleteSyaratSection = (index: number) => {
    const updated = syaratSections.filter((_, i) => i !== index);
    setSyaratSections(updated);
  };

  const moveSyaratSection = (index: number, direction: "up" | "down") => {
    const updated = [...syaratSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSyaratSections(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      tentang_kami_company_name: companyName,
      tentang_kami_description: description,
      tentang_kami_ppiu_no: ppiuNo,
      tentang_kami_sections: JSON.stringify(tentangSections),
      syarat_ketentuan_sections: JSON.stringify(syaratSections)
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire({
          title: "Berhasil Disimpan",
          text: "Informasi dan seksi halaman berhasil diperbarui dan disinkronisasikan ke akun jamaah secara instan.",
          icon: "success",
          confirmButtonColor: "#146349"
        });
      } else {
        throw new Error("Gagal menyimpan pengaturan");
      }
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Menyimpan",
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#146349"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-garis rounded-[22px] p-12 text-center shadow-card">
        <div className="w-8 h-8 border-4 border-hijau-200 border-t-hijau-800 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-teks-500 mt-3 font-semibold">Memuat informasi halaman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Navigation tabs */}
      <div className="flex p-1 bg-krem border border-garis rounded-2xl w-fit gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("tentang")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "tentang"
              ? "bg-hijau-900 text-white shadow-sm"
              : "text-teks-500 hover:text-teks-900"
          }`}
        >
          ℹ️ Tentang Kami
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("syarat")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "syarat"
              ? "bg-hijau-900 text-white shadow-sm"
              : "text-teks-500 hover:text-teks-900"
          }`}
        >
          📜 Syarat &amp; Ketentuan
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === "tentang" ? (
          <div className="space-y-6">
            {/* Core Card */}
            <div className="bg-white border border-garis rounded-[22px] p-6 sm:p-8 shadow-card space-y-5">
              <h3 className="text-sm font-bold text-hijau-900 border-b border-garis pb-2">Informasi Utama Perusahaan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors"
                    placeholder="PT Madinah Salam Wisata"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                    Nomor Izin PPIU
                  </label>
                  <input
                    type="text"
                    value={ppiuNo}
                    onChange={(e) => setPpiuNo(e.target.value)}
                    required
                    className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors font-mono font-bold"
                    placeholder="Izin PPIU Resmi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                  Deskripsi Perusahaan
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                  placeholder="Tulis deskripsi singkat perusahaan travel..."
                />
              </div>
            </div>

            {/* Dynamic Sections List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-hijau-900">Seksi Informasi (Tentang Kami)</h3>
                <button
                  type="button"
                  onClick={addTentangSection}
                  className="flex items-center gap-1 bg-hijau-100/50 hover:bg-hijau-100 border border-hijau-200/50 text-hijau-850 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Tambah Seksi Baru
                </button>
              </div>

              {tentangSections.map((section, idx) => (
                <div key={section.id} className="bg-white border border-garis rounded-[22px] p-5 sm:p-6 shadow-card space-y-4 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis/50 pb-3">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateTentangSection(idx, { title: e.target.value })}
                        required
                        className="bg-transparent border-none text-sm font-bold text-hijau-900 outline-none focus:ring-1 focus:ring-hijau-800 rounded px-1 w-full"
                        placeholder="Judul Seksi (misal: Visi Kami)"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Move Up Button */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveTentangSection(idx, "up")}
                        className="p-1.5 rounded-lg border border-garis hover:bg-krem transition-all disabled:opacity-30"
                        title="Naikkan Urutan"
                      >
                        <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      {/* Move Down Button */}
                      <button
                        type="button"
                        disabled={idx === tentangSections.length - 1}
                        onClick={() => moveTentangSection(idx, "down")}
                        className="p-1.5 rounded-lg border border-garis hover:bg-krem transition-all disabled:opacity-30"
                        title="Turunkan Urutan"
                      >
                        <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {/* Format toggle */}
                      <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-teks-500 select-none cursor-pointer border border-garis rounded-lg px-2.5 py-1 hover:bg-krem transition-all">
                        <input
                          type="checkbox"
                          checked={!!section.isList}
                          onChange={(e) => updateTentangSection(idx, { isList: e.target.checked })}
                          className="rounded text-hijau-900 focus:ring-hijau-800"
                        />
                        Daftar Poin
                      </label>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteTentangSection(idx)}
                        className="flex items-center gap-1 text-[10.5px] font-bold text-red-600 border border-red-200/50 hover:bg-red-50 rounded-lg px-2.5 py-1.5 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateTentangSection(idx, { content: e.target.value })}
                      required
                      rows={section.isList ? 5 : 3}
                      className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors leading-relaxed"
                      placeholder={
                        section.isList
                          ? "Masukkan poin misi/informasi, satu baris untuk satu poin..."
                          : "Tulis isi konten seksi informasi di sini..."
                      }
                    />
                  </div>
                </div>
              ))}

              {tentangSections.length === 0 && (
                <div className="bg-white border border-garis border-dashed rounded-[22px] p-12 text-center text-teks-400 font-medium">
                  Belum ada seksi informasi yang ditambahkan. Silakan klik "Tambah Seksi Baru".
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dynamic Accordions List (Syarat & Ketentuan) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-hijau-900">Item Akordeon (Syarat &amp; Ketentuan)</h3>
                <button
                  type="button"
                  onClick={addSyaratSection}
                  className="flex items-center gap-1 bg-hijau-100/50 hover:bg-hijau-100 border border-hijau-200/50 text-hijau-850 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Tambah Seksi Baru
                </button>
              </div>

              {syaratSections.map((section, idx) => (
                <div key={section.id} className="bg-white border border-garis rounded-[22px] p-5 sm:p-6 shadow-card space-y-4 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis/50 pb-3">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSyaratSection(idx, { title: e.target.value })}
                        required
                        className="bg-transparent border-none text-sm font-bold text-hijau-900 outline-none focus:ring-1 focus:ring-hijau-800 rounded px-1 w-full"
                        placeholder="Judul Seksi (misal: Syarat & Ketentuan Pendaftaran)"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Move Up Button */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSyaratSection(idx, "up")}
                        className="p-1.5 rounded-lg border border-garis hover:bg-krem transition-all disabled:opacity-30"
                        title="Naikkan Urutan"
                      >
                        <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      {/* Move Down Button */}
                      <button
                        type="button"
                        disabled={idx === syaratSections.length - 1}
                        onClick={() => moveSyaratSection(idx, "down")}
                        className="p-1.5 rounded-lg border border-garis hover:bg-krem transition-all disabled:opacity-30"
                        title="Turunkan Urutan"
                      >
                        <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {/* Format toggle */}
                      <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-teks-500 select-none cursor-pointer border border-garis rounded-lg px-2.5 py-1 hover:bg-krem transition-all">
                        <input
                          type="checkbox"
                          checked={!!section.isList}
                          onChange={(e) => updateSyaratSection(idx, { isList: e.target.checked })}
                          className="rounded text-hijau-900 focus:ring-hijau-800"
                        />
                        Daftar Poin
                      </label>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteSyaratSection(idx)}
                        className="flex items-center gap-1 text-[10.5px] font-bold text-red-600 border border-red-200/50 hover:bg-red-50 rounded-lg px-2.5 py-1.5 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSyaratSection(idx, { content: e.target.value })}
                      required
                      rows={section.isList ? 6 : 4}
                      className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors leading-relaxed"
                      placeholder={
                        section.isList
                          ? "Masukkan syarat/poin-poin informasi, satu baris untuk satu poin..."
                          : "Tulis konten lengkap seksi syarat & ketentuan di sini..."
                      }
                    />
                  </div>
                </div>
              ))}

              {syaratSections.length === 0 && (
                <div className="bg-white border border-garis border-dashed rounded-[22px] p-12 text-center text-teks-400 font-medium">
                  Belum ada item syarat ketentuan yang ditambahkan. Silakan klik "Tambah Seksi Baru".
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="bg-white border border-garis rounded-[22px] p-4 sm:p-5 flex justify-end shadow-card">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-hijau-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-hijau-800 transition-all duration-200 shadow-lg disabled:opacity-75"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Simpan Semua Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
