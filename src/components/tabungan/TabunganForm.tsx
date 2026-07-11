"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TabunganForm({ paket, maxBulan = 24 }: { paket: any, maxBulan?: number }) {
  const router = useRouter();
  
  const [jenisKamar, setJenisKamar] = useState<string>("Quad");
  const [jumlahJamaah, setJumlahJamaah] = useState<number>(1);
  const [durasiBulan, setDurasiBulan] = useState<number>(Math.min(12, maxBulan));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dapatkan harga sesuai jenis kamar
  const getHargaKamar = () => {
    switch(jenisKamar) {
      case "Quad": return Number(paket.harga_quad);
      case "Triple": return Number(paket.harga_triple);
      case "Double": return Number(paket.harga_double);
      default: return Number(paket.harga_quad);
    }
  };

  const hargaPerOrang = getHargaKamar();
  const totalBiaya = hargaPerOrang * jumlahJamaah;
  const setoranBulanan = Math.ceil(totalBiaya / durasiBulan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tabungan/baru", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paket: paket.id,
          jenis_kamar: jenisKamar,
          jumlah_jamaah: jumlahJamaah,
          durasi_bulan: durasiBulan,
          total_biaya: totalBiaya,
          setoran_bulanan: setoranBulanan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      router.push("/dashboard/tabungan");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-900 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Rencanakan Tabungan</h2>
        <p className="text-emerald-100 text-sm mt-1">{paket.nama_paket}</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">Pilih Jenis Kamar</label>
              <div className="grid grid-cols-3 gap-3">
                {["Quad", "Triple", "Double"].map((kamar) => (
                  <label 
                    key={kamar}
                    className={`
                      cursor-pointer border-2 rounded-lg p-3 text-center transition-all
                      ${jenisKamar === kamar 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900" 
                        : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <input 
                      type="radio" 
                      name="jenisKamar" 
                      value={kamar} 
                      checked={jenisKamar === kamar}
                      onChange={(e) => setJenisKamar(e.target.value)}
                      className="hidden"
                    />
                    <div className="font-bold">{kamar}</div>
                    <div className="text-xs mt-1">
                      {kamar === "Quad" ? "Sekamar Ber-4" : kamar === "Triple" ? "Sekamar Ber-3" : "Sekamar Ber-2"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">Jumlah Jamaah</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-emerald-900 font-bold flex items-center justify-center text-xl"
                >
                  -
                </button>
                <div className="w-16 text-center font-bold text-xl text-emerald-900">
                  {jumlahJamaah}
                </div>
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.min(paket.kuota, prev + 1))}
                  className="w-10 h-10 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-xl"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">Orang (Maks: {paket.kuota})</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-3">Target Durasi Menabung (Bulan)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="3" 
                  max={maxBulan} 
                  step="1" 
                  value={durasiBulan} 
                  onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(3, Number(e.target.value))))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />
                <div className="w-24 text-center">
                  <input 
                    type="number" 
                    value={durasiBulan} 
                    onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(3, Number(e.target.value))))}
                    className="w-16 text-center border-b-2 border-emerald-500 font-bold text-xl text-emerald-900 focus:outline-none focus:border-emerald-700"
                  />
                  <span className="text-sm text-emerald-700 font-medium ml-1">Bulan</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>3 Bulan</span>
                <span>{maxBulan} Bulan</span>
              </div>
            </div>

          </div>

          <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">Estimasi Biaya</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Harga per Orang (Kamar {jenisKamar})</span>
              <span className="font-semibold">{formatRp(hargaPerOrang)}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-emerald-200 pb-3">
              <span className="text-gray-600">Total Jamaah</span>
              <span className="font-semibold">{jumlahJamaah} Orang</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-emerald-900 font-medium">Total Keseluruhan</span>
              <span className="text-lg font-bold text-emerald-900">{formatRp(totalBiaya)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded border border-emerald-200 mt-3">
              <span className="text-emerald-700 font-bold">Setoran per Bulan</span>
              <span className="text-2xl font-black text-emerald-700">{formatRp(setoranBulanan)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white 
              ${isLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'} 
              transition-colors flex justify-center items-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : "Mulai Menabung Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
