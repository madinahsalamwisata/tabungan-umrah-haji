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
    <div className="bg-black/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden">
      <div className="bg-emerald-900/40 backdrop-blur-md px-6 py-5 border-b border-white/10">
        <h2 className="text-xl font-bold text-white drop-shadow-md">Rencanakan Tabungan</h2>
        <p className="text-emerald-100/90 text-sm mt-1">{paket.nama_paket}</p>
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
              <label className="block text-sm font-semibold text-emerald-300 mb-2">Pilih Jenis Kamar</label>
              <div className="grid grid-cols-3 gap-3">
                {["Quad", "Triple", "Double"].map((kamar) => (
                  <label 
                    key={kamar}
                    className={`
                      cursor-pointer border-2 rounded-xl p-3 text-center transition-all backdrop-blur-sm
                      ${jenisKamar === kamar 
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]" 
                        : "border-white/10 bg-black/30 text-gray-400 hover:border-white/30 hover:bg-white/5"
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
                    <div className="font-bold text-white">{kamar}</div>
                    <div className="text-[10px] mt-1 opacity-80">
                      {kamar === "Quad" ? "Sekamar Ber-4" : kamar === "Triple" ? "Sekamar Ber-3" : "Sekamar Ber-2"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-300 mb-2">Jumlah Jamaah</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xl transition-colors border border-white/20"
                >
                  -
                </button>
                <div className="w-16 text-center font-bold text-xl text-white">
                  {jumlahJamaah}
                </div>
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.min(paket.kuota, prev + 1))}
                  className="w-10 h-10 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-xl transition-colors border border-emerald-500/30"
                >
                  +
                </button>
                <span className="text-sm text-gray-400 ml-2">Orang (Maks: {paket.kuota})</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-300 mb-3">Target Durasi Menabung (Bulan)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="3" 
                  max={maxBulan} 
                  step="1" 
                  value={durasiBulan} 
                  onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(3, Number(e.target.value))))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="w-24 text-center">
                  <input 
                    type="number" 
                    value={durasiBulan} 
                    onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(3, Number(e.target.value))))}
                    className="w-16 text-center border-b-2 bg-transparent border-emerald-500/50 font-bold text-xl text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-sm text-emerald-400 font-medium ml-1">Bulan</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>3 Bulan</span>
                <span>{maxBulan} Bulan</span>
              </div>
            </div>

          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-xl p-5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Estimasi Biaya</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Harga per Orang (Kamar {jenisKamar})</span>
              <span className="font-semibold text-white">{formatRp(hargaPerOrang)}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
              <span className="text-gray-300">Total Jamaah</span>
              <span className="font-semibold text-white">{jumlahJamaah} Orang</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-emerald-300 font-medium">Total Keseluruhan</span>
              <span className="text-lg font-bold text-white">{formatRp(totalBiaya)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-black/60 p-3 rounded-lg border border-white/10 mt-3">
              <span className="text-emerald-300 font-bold">Setoran per Bulan</span>
              <span className="text-2xl font-black text-emerald-400">{formatRp(setoranBulanan)}</span>
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
