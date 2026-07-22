import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RiwayatClient from "../../../riwayat/RiwayatClient";

export const revalidate = 0;

export default async function TabunganRiwayatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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

  const rencanaTabungan = await prisma.rencanaTabungan.findUnique({
    where: { id: resolvedParams.id },
    include: {
      paket: true,
      RiwayatSetoran: {
        orderBy: { tanggal_setor: 'desc' }
      }
    }
  });

  if (!rencanaTabungan || rencanaTabungan.id_jamaah !== jamaah.id) {
    redirect("/dashboard/tabungan");
  }

  // Format data
  const riwayat = rencanaTabungan.RiwayatSetoran.map((setoran) => ({
    ...setoran,
    nominal: setoran.nominal.toString(),
    nama_paket: rencanaTabungan.paket.nama_paket,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-emerald-100 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-emerald-900 drop-shadow-md">
              Riwayat Transaksi
            </h3>
            <p className="text-sm text-emerald-700">{rencanaTabungan.paket.nama_paket}</p>
          </div>
        </div>
        
        <RiwayatClient riwayat={riwayat} />
      </div>
    </div>
  );
}
