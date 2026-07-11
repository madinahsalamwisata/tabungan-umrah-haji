import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";



export default async function PaketPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
  });

  if (!jamaah) {
    redirect("/login");
  }

  const pakets = await prisma.paket.findMany({
    orderBy: {
      tanggal_keberangkatan: 'asc'
    }
  });

  const now = new Date();
  // Hide estimation packages from this page as they belong to Tabungan
  const pastiPakets = pakets.filter(paket => !paket.nama_paket.includes("(Estimasi)"));

  const rencanaTabunganList = await prisma.rencanaTabungan.findMany({
    where: {
        id_jamaah: jamaah.id,
        status: { in: ["Aktif", "Lunas"] }
    },
    select: { id_paket: true }
  });

  const activePaketIds = rencanaTabunganList.map((r: any) => r.id_paket);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pilihan Paket Umrah (Jadwal Pasti)</h2>
        <p className="mt-1 text-sm text-gray-500">
          Daftar paket umrah dengan jadwal keberangkatan pasti. Untuk paket yang jadwalnya masih lebih dari 1 tahun, Anda dapat memilih opsi Booking Langsung atau menggunakan skema Tabungan.
        </p>
      </div>

      {pastiPakets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-emerald-900">Belum Ada Paket</h3>
          <p className="mt-1 text-sm text-emerald-500">
            Saat ini belum ada paket umrah dengan jadwal pasti yang tersedia.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pastiPakets.map((paket) => {
            const durasiHari = Math.round((paket.tanggal_kepulangan.getTime() - paket.tanggal_keberangkatan.getTime()) / (1000 * 60 * 60 * 24));
            const isAlreadySelected = activePaketIds.includes(paket.id);
            const depart = paket.tanggal_keberangkatan;

            // Helper to format currency and short currency (e.g. 29.5 jt)
            const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
            const formatShortCurrency = (val: number) => `Rp ${(val / 1000000).toLocaleString('id-ID', {maximumFractionDigits: 1})} jt`;

            const diskon = 1000000;
            const originalQuad = Number(paket.harga_quad) + diskon;
            const originalTriple = Number(paket.harga_triple) + diskon;
            const originalDouble = Number(paket.harga_double) + diskon;

            // Split fasilitas into an array
            const fasilitasArray = paket.deskripsi_fasilitas 
              ? paket.deskripsi_fasilitas.split(',').map((f: string) => f.trim()).filter(Boolean)
              : [
                  `Hotel Makkah: ${paket.hotel_makkah || "Setaraf"}`,
                  `Hotel Madinah: ${paket.hotel_madinah || "Setaraf"}`
                ];

            return (
              <div key={paket.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow relative max-w-5xl">
                
                {isAlreadySelected && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-20">
                    Terdaftar
                  </div>
                )}

                {/* Left Side: Image */}
                <div className="w-full md:w-[280px] shrink-0 relative bg-emerald-50 min-h-[200px] md:min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={paket.gambar || "/images/paket-umrah-rabiul-akhir-1448-h.jpeg"} 
                    alt={paket.nama_paket}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-0 left-0 bg-emerald-900 text-white font-bold px-2 py-0.5 rounded-br-lg text-xs z-10 shadow">
                    {durasiHari} Hari
                  </div>
                  <div className="absolute top-0 right-0 bg-red-500 text-white font-bold px-2 py-0.5 rounded-bl-lg text-xs z-10 flex items-center gap-1 shadow">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Diskon {formatCurrency(diskon)}
                  </div>
                </div>
                
                {/* Right Side: Content */}
                <div className="w-full p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-900 mb-1.5 leading-tight">
                      {paket.nama_paket} {paket.nama_paket.includes("Program") ? "" : `(Program ${durasiHari} Hari)`}
                    </h2>
                    
                    {/* Subtitle Info */}
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {paket.maskapai || "Menyesuaikan"}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {paket.tanggal_keberangkatan.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {paket.tanggal_kepulangan.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Fasilitas */}
                    <div className="mb-4">
                      <p className="font-bold text-gray-900 mb-2 text-xs">Fasilitas Utama:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-3">
                        <div className="flex items-start gap-1.5 text-xs text-gray-700">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>Hotel Makkah: {paket.hotel_makkah || "Setaraf"}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-gray-700">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>Hotel Madinah: {paket.hotel_madinah || "Setaraf"}</span>
                        </div>
                        {fasilitasArray.map((fasilitas: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>{fasilitas}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Pricing Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-end mt-3 pt-3 border-t border-gray-100">
                    <div className="w-full sm:w-auto mb-3 sm:mb-0">
                      <p className="text-xs text-gray-500 mb-0.5">Mulai dari (Quad)</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-emerald-800">{formatShortCurrency(Number(paket.harga_quad))}</span>
                        <span className="text-gray-400 line-through text-sm font-medium">{formatCurrency(originalQuad)}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-end">
                      <div className="text-xs text-gray-600 mb-2.5 space-y-0.5 text-right w-full sm:w-auto">
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Quad:</span>
                          <span><strong className="text-gray-900">{formatCurrency(Number(paket.harga_quad))}</strong> <span className="text-gray-400 line-through text-[10px]">{formatCurrency(originalQuad)}</span></span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Triple:</span>
                          <span><strong className="text-gray-900">{formatCurrency(Number(paket.harga_triple))}</strong> <span className="text-gray-400 line-through text-[10px]">{formatCurrency(originalTriple)}</span></span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-2.5">
                          <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Double:</span>
                          <span><strong className="text-gray-900">{formatCurrency(Number(paket.harga_double))}</strong> <span className="text-gray-400 line-through text-[10px]">{formatCurrency(originalDouble)}</span></span>
                        </div>
                      </div>

                      {(() => {
                        const oneYearFromNow = new Date();
                        // Add exactly 1 year from today's date
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                        
                        // User requirement: if it's more than 1 year away, allow tabungan
                        const isMoreThanOneYear = depart > oneYearFromNow;

                        return (
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3">
                            {isMoreThanOneYear && !isAlreadySelected && (
                              <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}`} className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2 px-5 text-sm rounded-full shadow-sm transition-colors text-center whitespace-nowrap">
                                Mulai Tabungan
                              </Link>
                            )}
                            {isMoreThanOneYear && isAlreadySelected && (
                              <button disabled className="w-full sm:w-auto bg-gray-100 text-gray-500 font-bold py-2 px-5 text-sm rounded-full cursor-not-allowed text-center whitespace-nowrap">
                                Sudah Ditabung
                              </button>
                            )}
                            <a href="https://www.madinahsalamwisata.com/paket/1" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-5 text-sm rounded-full shadow transition-colors text-center whitespace-nowrap">
                              Booking Langsung
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
