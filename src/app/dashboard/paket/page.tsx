import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PaketSearchClient from "@/components/paket/PaketSearchClient";



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
  // Also deduplicate by name to prevent duplicate dummy packages showing up
  const uniqueNames = new Set();
  const pastiPakets = pakets.filter(paket => {
    if (paket.nama_paket.includes("(Estimasi)")) return false;
    
    // Normalize name to deduplicate those that have tags like '(< 1 Tahun)'
    let baseName = paket.nama_paket;
    if (baseName.includes('< 1 Tahun')) baseName = 'Umrah Reguler';
    if (baseName.includes('Tepat > 1 Tahun')) baseName = 'Umrah Spesial';
    if (baseName.includes('1.5 Tahun')) baseName = 'Umrah Plus';
    
    // Override name for display if it's a dummy package
    if (paket.nama_paket !== baseName) {
        paket.nama_paket = baseName;
    }

    if (uniqueNames.has(baseName)) return false;
    uniqueNames.add(baseName);
    return true;
  }).map(paket => ({
    ...paket,
    harga_quad: paket.harga_quad.toString(),
    harga_triple: paket.harga_triple.toString(),
    harga_double: paket.harga_double.toString(),
  }));

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

      <PaketSearchClient pakets={pastiPakets} activePaketIds={activePaketIds} />
    </div>
  );
}
