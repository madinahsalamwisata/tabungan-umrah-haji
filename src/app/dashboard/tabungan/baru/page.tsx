import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TabunganForm from "@/components/tabungan/TabunganForm";

export default async function TabunganBaruPage(props: {
  searchParams: Promise<{ paketId?: string, source?: string }>;
}) {
  const searchParams = await props.searchParams;
  const paketId = searchParams.paketId;
  const source = searchParams.source;

  if (!paketId) {
    return notFound();
  }

  const paket = await prisma.paket.findUnique({
    where: { id: paketId },
  });

  if (!paket) {
    return notFound();
  }

  // Calculate max months allowed based on departure date
  const now = new Date();
  const depart = paket.tanggal_keberangkatan;
  const diffInMonths = (depart.getFullYear() - now.getFullYear()) * 12 + (depart.getMonth() - now.getMonth());
  // Ensure minimum max is 3 just in case, or cap at diffInMonths
  const maxBulan = Math.max(3, diffInMonths);

  // Convert Decimal to string for Client Component serialization
  const serializedPaket = {
    ...paket,
    harga_quad: paket.harga_quad.toString(),
    harga_triple: paket.harga_triple.toString(),
    harga_double: paket.harga_double.toString(),
  };

  const backUrl = source === 'paket' ? '/dashboard/paket' : '/dashboard/tabungan';
  const backText = source === 'paket' ? 'Kembali ke Pilihan Paket' : 'Kembali ke Tabungan';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-6">
        <Link href={backUrl} className="inline-flex items-center text-sm font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-md">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {backText}
        </Link>
      </div>
      <TabunganForm paket={serializedPaket} maxBulan={maxBulan} />
    </div>
  );
}
