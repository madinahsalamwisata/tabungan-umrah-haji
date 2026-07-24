"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TabunganForm({ paket, maxBulan = 24 }: { paket: any, maxBulan?: number }) {
  const router = useRouter();
  
  const [jenisKamar, setJenisKamar] = useState<string>("Quad");
  const [jumlahJamaah, setJumlahJamaah] = useState<number>(1);
  const minBulanAllowed = Math.min(3, maxBulan); // if max is 2, min is 2, if max 24, min is 3
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
  const totalBiayaPaket = hargaPerOrang * jumlahJamaah;
  const biayaAdmin = 500000;
  const totalKeseluruhan = totalBiayaPaket + biayaAdmin;
  const setoranBulanan = Math.ceil(totalBiayaPaket / durasiBulan);

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
          total_biaya: totalKeseluruhan,
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
    <div className="bg-white border border-garis rounded-[22px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-hijau-900 to-hijau-800 px-6 py-5 text-white">
        <h2 className="text-lg font-bold font-serif text-white">Rencanakan Tabungan</h2>
        <p className="text-white/70 text-xs mt-1">{paket.nama_paket}</p>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Pilihan Kamar */}
            <div>
              <label className="block text-xs font-bold text-teks-900 uppercase tracking-wider mb-2.5">Pilih Jenis Kamar</label>
              <div className="grid grid-cols-3 gap-2.5">
                {["Quad", "Triple", "Double"].map((kamar) => (
                  <label 
                    key={kamar}
                    className={`
                      cursor-pointer border-2 rounded-xl p-3 text-center transition-all select-none
                      ${jenisKamar === kamar 
                        ? "border-emas bg-hijau-900 text-white shadow-sm" 
                        : "border-garis bg-white text-teks-900 hover:bg-krem"
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
                    <div className={`font-bold text-sm ${jenisKamar === kamar ? "text-white" : "text-teks-900"}`}>{kamar}</div>
                    <div className={`text-[9px] mt-1 ${jenisKamar === kamar ? "text-white/70" : "text-teks-500"}`}>
                      {kamar === "Quad" ? "Ber-4" : kamar === "Triple" ? "Ber-3" : "Ber-2"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Jumlah Jamaah */}
            <div>
              <label className="block text-xs font-bold text-teks-900 uppercase tracking-wider mb-2.5">Jumlah Jamaah</label>
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-krem hover:bg-garis text-teks-900 font-bold flex items-center justify-center text-lg transition-colors border border-garis/60"
                >
                  -
                </button>
                <div className="w-10 text-center font-bold text-base text-teks-900">
                  {jumlahJamaah}
                </div>
                <button
                  type="button"
                  onClick={() => setJumlahJamaah(prev => Math.min(paket.kuota, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-krem hover:bg-garis text-teks-900 font-bold flex items-center justify-center text-lg transition-colors border border-garis/60"
                >
                  +
                </button>
                <span className="text-xs text-teks-500 font-medium">Jamaah (Maks: {paket.kuota})</span>
              </div>
            </div>

            {/* Durasi Menabung */}
            <div>
              <label className="block text-xs font-bold text-teks-900 uppercase tracking-wider mb-2.5">Durasi Menabung</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min={minBulanAllowed} 
                  max={maxBulan} 
                  step="1" 
                  value={durasiBulan} 
                  onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(minBulanAllowed, Number(e.target.value))))}
                  className="w-full h-1 bg-garis rounded-lg appearance-none cursor-pointer accent-hijau-800"
                />
                <div className="w-20 text-center shrink-0 flex items-center justify-end">
                  <input 
                    type="number" 
                    value={durasiBulan} 
                    onChange={(e) => setDurasiBulan(Math.min(maxBulan, Math.max(minBulanAllowed, Number(e.target.value))))}
                    className="w-10 text-center border-b border-garis font-bold text-base text-teks-900 focus:outline-none focus:border-hijau-750"
                  />
                  <span className="text-xs text-teks-500 font-bold ml-1">Bln</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-teks-300 font-bold mt-2">
                <span>{minBulanAllowed} Bulan</span>
                <span>{maxBulan} Bulan</span>
              </div>
            </div>
          </div>

          {/* Estimasi Biaya Box */}
          <div className="bg-gradient-to-br from-hijau-900 to-hijau-800 rounded-2xl p-5 text-white shadow-sm space-y-3 relative overflow-hidden">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Estimasi Rincian</h3>
            
            <div className="flex justify-between items-center text-xs text-white/80">
              <span>Biaya Kamar ({jenisKamar})</span>
              <span className="font-semibold">{formatRp(hargaPerOrang)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-white/80 border-b border-white/10 pb-3">
              <span>Jumlah Jamaah</span>
              <span className="font-semibold">{jumlahJamaah} Orang</span>
            </div>

            <div className="flex justify-between items-center text-xs text-white/80 border-b border-white/10 pb-3">
              <span>Biaya Admin (Hanya Awal)</span>
              <span className="font-semibold">{formatRp(biayaAdmin)}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm font-semibold">
              <span>Total Keseluruhan</span>
              <span>{formatRp(totalKeseluruhan)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white/10 border border-white/15 p-3.5 rounded-xl shadow-inner mt-4">
              <span className="text-xs text-white/80 font-bold">Setoran per Bulan</span>
              <span className="text-xl font-black text-emas">{formatRp(setoranBulanan)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-hijau-900 bg-emas hover:bg-emas/90 focus:outline-none transition-colors flex justify-center items-center active:scale-98`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-hijau-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
