import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RiwayatClient from "./RiwayatClient";

export const revalidate = 0;

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
    include: {
      RencanaTabungan: {
        include: {
          paket: true,
          RiwayatSetoran: {
            orderBy: { tanggal_setor: 'desc' }
          }
        }
      }
    }
  });

  if (!jamaah) {
    redirect("/login");
  }

  // Gabungkan semua riwayat setoran dari semua rencana tabungan
  let allRiwayat: any[] = [];
  
  jamaah.RencanaTabungan.forEach(rencana => {
    rencana.RiwayatSetoran.forEach(setoran => {
      allRiwayat.push({
        ...setoran,
        nominal: setoran.nominal.toString(),
        nama_paket: rencana.paket.nama_paket,
        is_haji: rencana.paket.is_haji,
      });
    });
  });

  // Urutkan berdasarkan tanggal_setor terbaru
  allRiwayat.sort((a, b) => new Date(b.tanggal_setor).getTime() - new Date(a.tanggal_setor).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-emerald-900 drop-shadow-md mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Riwayat Seluruh Transaksi
        </h3>
        
        <RiwayatClient riwayat={allRiwayat} />
      </div>
    </div>
  );
}
