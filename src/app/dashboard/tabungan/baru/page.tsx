import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import TabunganForm from "@/components/tabungan/TabunganForm";

const prisma = new PrismaClient();

export default async function TabunganBaruPage({
  searchParams,
}: {
  searchParams: { paketId?: string };
}) {
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <TabunganForm paket={paket} />
    </div>
  );
}
