import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";



export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
    include: {
      RencanaTabungan: {
        include: {
          paket: true,
          RiwayatSetoran: true
        }
      }
    }
  });

  if (!jamaah) {
    redirect("/login");
  }

  // Because this is a server component passing to client component, 
  // we must avoid passing complex Prisma objects with Dates directly if not serialized,
  // but Strings and nulls are fine.
  const serializedJamaah = {
    id: jamaah.id,
    nama: jamaah.nama,
    email: jamaah.email,
    no_hp: jamaah.no_hp,
    nik: jamaah.nik,
    alamat: jamaah.alamat,
    foto_url: jamaah.foto_url,
  };

  let rencanaAktif = jamaah.RencanaTabungan;

  // Tampilkan data dummy realistis jika belum ada data riwayat tabungan di database
  if (rencanaAktif.length === 0) {
    rencanaAktif = [
      {
        id: "dummy-1",
        id_jamaah: jamaah.id,
        id_paket: "paket-1",
        jenis_kamar: "Quad",
        periode_bulan: 12,
        total_biaya: 28500000 as any,
        setoran_per_bulan: 2375000 as any,
        tanggal_mulai: new Date("2024-01-10") as any,
        status: "Aktif",
        paket: {
          id: "paket-1",
          nama_paket: "Paket Umrah Plus Turki 12 Hari",
          tanggal_keberangkatan: new Date("2024-12-15") as any,
          hotel: "Swissotel Al Maqam / Setaraf",
          maskapai: "Turkish Airlines",
          harga_quad: 28500000 as any,
          harga_double: 32500000 as any,
          harga_triple: 30500000 as any,
          kuota: 45,
        },
        RiwayatSetoran: [],
      } as any,
      {
        id: "dummy-2",
        id_jamaah: jamaah.id,
        id_paket: "paket-2",
        jenis_kamar: "Double",
        periode_bulan: 24,
        total_biaya: 26000000 as any,
        setoran_per_bulan: 1083333 as any,
        tanggal_mulai: new Date("2022-05-01") as any,
        status: "Lunas",
        paket: {
          id: "paket-2",
          nama_paket: "Paket Umrah Reguler 9 Hari",
          tanggal_keberangkatan: new Date("2023-08-10") as any,
          hotel: "Anjum Hotel Makkah",
          maskapai: "Saudia Airlines",
          harga_quad: 26000000 as any,
          harga_double: 29000000 as any,
          harga_triple: 27500000 as any,
          kuota: 90,
        },
        RiwayatSetoran: [],
      } as any,
    ];
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Profil Saya</h1>
        <p className="mt-1 text-sm text-emerald-300 drop-shadow-sm">
          Kelola informasi data diri dan riwayat tabungan Anda.
        </p>
      </div>

      {/* Komponen Form Profil (Riwayat Tabungan sebagai children) */}
      <ProfileForm jamaah={serializedJamaah}>
        {/* Seksi Riwayat Tabungan */}
        <div className="relative rounded-3xl overflow-hidden mt-0 bg-black/40 backdrop-blur-xl border border-white/10 animate-in fade-in zoom-in-95 duration-500 delay-150">
          <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat Tabungan Saya
            </h3>
          </div>
          
          <div className="relative z-10 p-6 max-h-[320px] overflow-y-auto custom-scrollbar">
            {rencanaAktif.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {rencanaAktif.map((rencana: any) => {
                  const totalTerkumpul = rencana.RiwayatSetoran
                    ? rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success")
                        .reduce((sum: number, r: any) => sum + Number(r.nominal), 0)
                    : 0;

                  return (
                    <div key={rencana.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Info Paket */}
                      <div className="flex-1 pl-2 sm:pl-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {rencana.paket?.nama_paket}
                          </h4>
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-black rounded shadow-inner ${
                            rencana.status === 'Lunas' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {rencana.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-medium">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date(rencana.tanggal_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Kamar {rencana.jenis_kamar}
                          </div>
                        </div>
                      </div>

                      {/* Info Dana */}
                      <div className="sm:text-right shrink-0 bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Terkumpul</p>
                        <p className="text-lg font-black text-emerald-400">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalTerkumpul)}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          / {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rencana.total_biaya)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 px-4 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
                <svg className="mx-auto h-10 w-10 text-emerald-500/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-bold text-white mb-1">Belum Ada Tabungan</h3>
                <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">Yuk mulai menabung untuk wujudkan mimpimu ke tanah suci!</p>
                <Link 
                  href="/dashboard/tabungan/baru" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-emerald-900/50 transition-all hover:scale-105"
                >
                  Mulai Menabung
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </ProfileForm>
    </div>
  );
}
