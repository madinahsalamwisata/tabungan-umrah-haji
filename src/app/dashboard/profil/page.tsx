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

  const rencanaAktif = jamaah.RencanaTabungan;

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
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-emerald-900">
            Riwayat Tabungan Saya
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-emerald-600">
            Daftar paket umrah yang sedang atau pernah Anda ikuti.
          </p>
        </div>
        
        <div className="border-t border-emerald-100 p-6 bg-emerald-50/30">
          {rencanaAktif.length > 0 ? (
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
                  {rencanaAktif.map((rencana) => (
                    <tr key={rencana.id} className="hover:bg-emerald-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-900">
                        {rencana.paket.nama_paket}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700">
                        Rp 0 {/* Temporary placeholder since we don't calculate sum of deposits yet */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-emerald-900">Belum Ada Tabungan</h3>
              <p className="mt-1 text-sm text-emerald-500">
                Anda belum memiliki rencana tabungan aktif saat ini.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/paket"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-emerald-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-emerald-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Pilih Paket Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
