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


      {/* Komponen Form Profil (Riwayat Tabungan sebagai children) */}
      <ProfileForm jamaah={serializedJamaah}>
        {/* Seksi Riwayat Tabungan */}
        <div className="bg-white border border-garis rounded-3xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="px-5 py-4.5 border-b border-garis flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-sm font-bold text-teks-900 font-serif flex items-center gap-2">
              <svg className="w-4 h-4 text-hijau-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat Tabungan Saya
            </h3>
          </div>
          
          <div className="p-5 max-h-[320px] overflow-y-auto pr-1">
            {rencanaAktif.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {rencanaAktif.map((rencana: any) => {
                  const totalTerkumpul = rencana.RiwayatSetoran
                    ? rencana.RiwayatSetoran.filter((r: any) => r.status_pembayaran === "success")
                        .reduce((sum: number, r: any) => sum + Number(r.nominal), 0)
                    : 0;

                  return (
                    <div key={rencana.id} className="group relative bg-krem/40 hover:bg-krem/80 border border-garis rounded-2xl p-4 transition-all overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="absolute inset-y-0 left-0 w-1 bg-emas opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Info Paket */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xs font-bold text-teks-900 group-hover:text-hijau-800 transition-colors line-clamp-1">
                            {rencana.paket?.nama_paket}
                          </h4>
                          <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-black rounded-md ${
                            rencana.status === 'Lunas' 
                              ? 'bg-yellow-500 text-hijau-900' 
                              : 'bg-hijau-100 text-hijau-800'
                          }`}>
                            {rencana.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-teks-500 font-semibold">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 stroke-teks-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            {new Date(rencana.tanggal_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 stroke-teks-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            {rencana.jenis_kamar} Room
                          </div>
                        </div>
                      </div>

                      {/* Info Dana */}
                      <div className="sm:text-right shrink-0 bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-garis sm:border-0">
                        <p className="text-[9px] text-teks-400 uppercase tracking-wider font-bold mb-0.5">Terkumpul</p>
                        <p className="text-sm font-black text-teks-900">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalTerkumpul)}
                        </p>
                        <p className="text-[10px] text-teks-500 font-medium">
                          / {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rencana.total_biaya)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-garis rounded-2xl bg-krem/20">
                <svg className="mx-auto h-8 w-8 text-teks-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-xs font-bold text-teks-900 mb-1">Belum Ada Tabungan</h4>
                <p className="text-[11px] text-teks-500 mb-4 max-w-xs mx-auto">Yuk mulai menabung untuk wujudkan mimpimu ke tanah suci!</p>
                <Link 
                  href="/dashboard/tabungan/baru" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emas hover:bg-emas/90 text-hijau-900 text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Mulai Menabung
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </ProfileForm>
    </div>
  );
}
