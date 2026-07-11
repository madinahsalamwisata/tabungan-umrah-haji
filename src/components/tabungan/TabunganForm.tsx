"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TabunganForm({ paket }: { paket: any }) {
  const router = useRouter();
  const [jenisKamar, setJenisKamar] = useState<"Quad" | "Triple" | "Double">("Quad");
  const [durasiBulan, setDurasiBulan] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to determine price based on room
  const hargaKamar = 
    jenisKamar === "Quad" ? Number(paket.harga_quad) : 
    jenisKamar === "Triple" ? Number(paket.harga_triple) : 
    Number(paket.harga_double);

  const setoranPerBulan = hargaKamar / durasiBulan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/tabungan/baru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paketId: paket.id,
          jenisKamar,
          durasiBulan,
          totalBiaya: hargaKamar,
          setoranPerBulan
        })
      });

      if (!res.ok) {
        throw new Error("Gagal membuat rencana tabungan");
      }

      // Redirect ke riwayat tabungan
      router.push("/dashboard/profil");
      router.refresh();
    } catch (err) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-900 px-6 py-4 border-b-4 border-emerald-600">
        <h2 className="text-xl font-bold text-white">Kalkulator Tabungan Umrah</h2>
        <p className="text-emerald-100 text-sm mt-1">Sesuaikan rencana cicilan Anda untuk paket: {paket.nama_paket}</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Pilihan Kamar */}
        <div>
          <label className="block text-sm font-semibold text-emerald-900 mb-3">Pilih Jenis Kamar</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["Quad", "Triple", "Double"] as const).map((tipe) => {
              const harga = tipe === "Quad" ? paket.harga_quad : tipe === "Triple" ? paket.harga_triple : paket.harga_double;
              const isSelected = jenisKamar === tipe;
              return (
                <div 
                  key={tipe}
                  onClick={() => setJenisKamar(tipe)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected 
                      ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 ring-opacity-50" 
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${isSelected ? "text-emerald-900" : "text-gray-700"}`}>{tipe}</span>
                    {isSelected && (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Kamar untuk {tipe === "Quad" ? "4" : tipe === "Triple" ? "3" : "2"} orang</p>
                  <p className="font-semibold text-emerald-700">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(harga))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pilihan Durasi */}
        <div>
          <label className="block text-sm font-semibold text-emerald-900 mb-3">Target Durasi Menabung (Bulan)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="3" 
              max="24" 
              step="1" 
              value={durasiBulan} 
              onChange={(e) => setDurasiBulan(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="w-24 text-center">
              <input 
                type="number" 
                value={durasiBulan} 
                onChange={(e) => setDurasiBulan(Number(e.target.value))}
                className="w-16 text-center border-b-2 border-emerald-500 font-bold text-xl text-emerald-900 focus:outline-none focus:border-emerald-700"
              />
              <span className="text-sm text-emerald-700 font-medium ml-1">Bulan</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>3 Bulan</span>
            <span>24 Bulan</span>
          </div>
        </div>

        <div className="h-px bg-emerald-100"></div>

        {/* Ringkasan Biaya */}
        <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
          <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider mb-4">Ringkasan Biaya Bulanan</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Biaya Paket ({jenisKamar})</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(hargaKamar)}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Dibagi {durasiBulan} bulan</span>
            <span className="font-medium text-gray-900 text-sm">
              Tiap bulan bayar sama rata
            </span>
          </div>
          
          <div className="pt-4 border-t border-emerald-200 flex justify-between items-center">
            <span className="text-lg font-bold text-emerald-900">Estimasi Setoran per Bulan</span>
            <span className="text-2xl font-black text-emerald-700">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(setoranPerBulan)}
            </span>
          </div>
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 rounded-lg font-bold text-lg text-white shadow-md transition-all ${
            isSubmitting ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800 hover:shadow-lg"
          }`}
        >
          {isSubmitting ? "Menyimpan Rencana..." : "Mulai Menabung Sekarang"}
        </button>
      </div>
    </form>
  );
}
