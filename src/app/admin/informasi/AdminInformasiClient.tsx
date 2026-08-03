"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AdminInformasiClient() {
  const [activeTab, setActiveTab] = useState<"tentang" | "syarat">("tentang");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    tentang_kami_company_name: "",
    tentang_kami_description: "",
    tentang_kami_ppiu_no: "",
    tentang_kami_visi: "",
    tentang_kami_misi: "",
    syarat_ketentuan_pendaftaran: "",
    syarat_ketentuan_pembatalan: "",
    syarat_ketentuan_khusus: "",
    syarat_ketentuan_pembayaran: "",
    syarat_ketentuan_perlengkapan: ""
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setForm({
            tentang_kami_company_name: data.tentang_kami_company_name || "",
            tentang_kami_description: data.tentang_kami_description || "",
            tentang_kami_ppiu_no: data.tentang_kami_ppiu_no || "",
            tentang_kami_visi: data.tentang_kami_visi || "",
            tentang_kami_misi: data.tentang_kami_misi || "",
            syarat_ketentuan_pendaftaran: data.syarat_ketentuan_pendaftaran || "",
            syarat_ketentuan_pembatalan: data.syarat_ketentuan_pembatalan || "",
            syarat_ketentuan_khusus: data.syarat_ketentuan_khusus || "",
            syarat_ketentuan_pembayaran: data.syarat_ketentuan_pembayaran || "",
            syarat_ketentuan_perlengkapan: data.syarat_ketentuan_perlengkapan || ""
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        Swal.fire({
          title: "Berhasil Disimpan",
          text: "Informasi halaman berhasil diperbarui dan disinkronisasikan ke akun jamaah.",
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
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
      {/* Navigation tabs */}
      <div className="flex p-1 bg-krem border border-garis rounded-2xl w-fit gap-1">
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

      <form onSubmit={handleSave} className="bg-white border border-garis rounded-[22px] p-6 sm:p-8 shadow-card space-y-6">
        {activeTab === "tentang" ? (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Nama Perusahaan
              </label>
              <input
                type="text"
                name="tentang_kami_company_name"
                value={form.tentang_kami_company_name}
                onChange={handleChange}
                required
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors"
                placeholder="Contoh: PT Madinah Salam Wisata"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Nomor Izin PPIU
              </label>
              <input
                type="text"
                name="tentang_kami_ppiu_no"
                value={form.tentang_kami_ppiu_no}
                onChange={handleChange}
                required
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors font-mono font-bold"
                placeholder="Masukkan Nomor Izin PPIU Resmi"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Deskripsi Perusahaan
              </label>
              <textarea
                name="tentang_kami_description"
                value={form.tentang_kami_description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Tulis deskripsi singkat mengenai perusahaan travel..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Visi Kami
              </label>
              <textarea
                name="tentang_kami_visi"
                value={form.tentang_kami_visi}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none italic leading-relaxed"
                placeholder="Tulis visi perusahaan..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500">
                  Misi Kami
                </label>
                <span className="text-[10px] text-teks-400 font-bold">ℹ️ Masukkan satu poin per baris (tekan Enter untuk baris baru)</span>
              </div>
              <textarea
                name="tentang_kami_misi"
                value={form.tentang_kami_misi}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Tulis poin-poin misi di sini..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500">
                  Syarat &amp; Ketentuan Pendaftaran
                </label>
                <span className="text-[10px] text-teks-400 font-bold">ℹ️ Masukkan satu poin per baris</span>
              </div>
              <textarea
                name="syarat_ketentuan_pendaftaran"
                value={form.syarat_ketentuan_pendaftaran}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Masukkan persyaratan pendaftaran..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Syarat &amp; Ketentuan Pembatalan
              </label>
              <textarea
                name="syarat_ketentuan_pembatalan"
                value={form.syarat_ketentuan_pembatalan}
                onChange={handleChange}
                required
                rows={8}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Tulis rincian ketentuan pembatalan & pengembalian dana..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Ketentuan Khusus
              </label>
              <textarea
                name="syarat_ketentuan_khusus"
                value={form.syarat_ketentuan_khusus}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Tulis ketentuan khusus (misal: Klausul Force Majeure atau Penyesuaian Harga)..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Alur Pembayaran
              </label>
              <textarea
                name="syarat_ketentuan_pembayaran"
                value={form.syarat_ketentuan_pembayaran}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Tulis mekanisme atau alur pembayaran tabungan..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-teks-500 mb-2">
                Perlengkapan yang Disediakan
              </label>
              <textarea
                name="syarat_ketentuan_perlengkapan"
                value={form.syarat_ketentuan_perlengkapan}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-krem border border-garis rounded-xl px-4 py-2.5 text-xs text-teks-900 outline-none focus:border-hijau-800 transition-colors resize-none leading-relaxed"
                placeholder="Sebutkan perlengkapan yang didapatkan jamaah..."
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-garis flex justify-end">
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
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
