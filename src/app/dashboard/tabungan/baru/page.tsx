import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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
      <TabunganForm paket={serializedPaket} />
    </div>
  );
}
