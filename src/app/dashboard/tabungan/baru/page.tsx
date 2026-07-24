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
  let maxBulan = 24;
  if (!paket.is_estimasi && paket.tanggal_keberangkatan) {
    const now = new Date();
    const depart = new Date(paket.tanggal_keberangkatan);
    const diffInMonths = (depart.getFullYear() - now.getFullYear()) * 12 + (depart.getMonth() - now.getMonth());
    maxBulan = Math.max(1, diffInMonths); // Could be very short if departing soon
  }

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
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <TabunganForm paket={serializedPaket} maxBulan={maxBulan} />
    </div>
  );
}
