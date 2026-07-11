import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";

const prisma = new PrismaClient();

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
          paket: true
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-emerald-600">
          Kelola informasi data diri dan riwayat tabungan Anda.
        </p>
      </div>

      {/* Komponen Form Profil */}
      <ProfileForm jamaah={serializedJamaah} />

      {/* Seksi Riwayat Tabungan */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-yellow-500 mt-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-emerald-900">
              Riwayat Tabungan Saya
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-emerald-600">
              Daftar paket umrah yang sedang atau pernah Anda ikuti.
            </p>
          </div>
        </div>
        
        <div className="border-t border-emerald-100 p-6 bg-emerald-50/30">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-200">
              <thead className="bg-emerald-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Nama Paket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Total Terkumpul
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-100">
                {rencanaAktif.map((rencana: any) => {
                  // Simulasi total uang yang terkumpul
                  let totalTerkumpul = 0;
                  if (rencana.status === "Lunas") {
                    totalTerkumpul = rencana.total_biaya;
                  } else {
                    totalTerkumpul = (rencana.total_biaya / 2); // Dummy: Anggap terkumpul setengah
                  }

                  return (
                    <tr key={rencana.id} className="hover:bg-emerald-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-900">
                        {rencana.paket?.nama_paket}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rencana.status === 'Lunas' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rencana.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700 font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalTerkumpul)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
