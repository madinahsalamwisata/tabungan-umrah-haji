import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

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
        <h2 className="text-2xl font-bold text-gray-900">Pilihan Paket Umrah</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pilih paket umrah yang sesuai dengan rencana keberangkatan dan budget Anda.
        </p>
      </div>

      {pakets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-emerald-900">Belum Ada Paket</h3>
          <p className="mt-1 text-sm text-emerald-500">
            Saat ini belum ada paket umrah yang tersedia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pakets.map((paket) => {
            const durasiHari = Math.round((paket.tanggal_kepulangan.getTime() - paket.tanggal_keberangkatan.getTime()) / (1000 * 60 * 60 * 24));
            const isAlreadySelected = activePaketIds.includes(paket.id);
            
            return (
              <div key={paket.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100 flex flex-col hover:shadow-lg transition-shadow relative">
                
                {isAlreadySelected && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    Terdaftar
                  </div>
                )}

                <div className="bg-emerald-900 px-6 py-4 border-b-4 border-yellow-500">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {paket.nama_paket}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 shrink-0 ml-4">
                      {durasiHari} Hari
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  {/* Jadwal & Pesawat */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Jadwal</p>
                      <p className="text-sm font-semibold text-emerald-950">
                        {paket.tanggal_keberangkatan.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <br/>s/d<br/>
                        {paket.tanggal_kepulangan.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Maskapai</p>
                      <p className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {paket.maskapai}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-emerald-100 my-2"></div>

                  {/* Akomodasi Hotel */}
                  <div>
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-2">Akomodasi Hotel</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-emerald-950">Makkah: {paket.hotel_makkah}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-emerald-950">Madinah: {paket.hotel_madinah}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-emerald-100 my-2"></div>

                  {/* Harga */}
                  <div>
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-2">Harga Paket</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium mb-1">Quad (Ber-4)</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(paket.harga_quad))}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium mb-1">Triple (Ber-3)</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(paket.harga_triple))}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium mb-1">Double (Ber-2)</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(paket.harga_double))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fasilitas */}
                  {paket.deskripsi_fasilitas && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Catatan / Fasilitas</p>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                        {paket.deskripsi_fasilitas}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-emerald-50 border-t border-emerald-100 mt-auto">
                  {isAlreadySelected ? (
                    <button disabled className="w-full bg-gray-300 text-gray-600 font-medium py-3 px-4 rounded-md shadow-sm cursor-not-allowed flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Sudah Dipilih
                    </button>
                  ) : (
                    <Link href={`/dashboard/tabungan/baru?paketId=${paket.id}`} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pilih Paket Ini
                    </Link>
                  )}
                  <p className="text-center text-xs text-emerald-600 mt-2 font-medium">Sisa Kuota: {paket.kuota} Kursi</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
