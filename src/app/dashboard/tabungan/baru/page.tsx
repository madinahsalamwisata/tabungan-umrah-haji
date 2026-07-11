import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TabunganForm from "@/components/tabungan/TabunganForm";

export default async function TabunganBaruPage(props: {
  searchParams: Promise<{ paketId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const paketId = searchParams.paketId;

  if (!paketId) {
    return notFound();
  }

  const paket = await prisma.paket.findUnique({
    where: { id: paketId },
  });

  if (!paket) {
    return notFound();
  }

  // Convert Decimal to string for Client Component serialization
  const serializedPaket = {
    ...paket,
    harga_quad: paket.harga_quad.toString(),
    harga_triple: paket.harga_triple.toString(),
    harga_double: paket.harga_double.toString(),
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-6">
        <Link href="/dashboard/tabungan" className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Tabungan
        </Link>
      </div>
      <TabunganForm paket={serializedPaket} />
    </div>
  );
}
