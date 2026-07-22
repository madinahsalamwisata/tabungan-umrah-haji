import { prisma } from "@/lib/prisma";
import InformasiClient from "./InformasiClient";

export const revalidate = 0;

export default async function InformasiPage() {
  const pengumuman = await prisma.pengumuman.findMany({
    orderBy: [
      { is_penting: 'desc' },
      { created_at: 'desc' }
    ]
  });

  const serializedPengumuman = pengumuman.map(p => ({
    ...p,
    created_at: p.created_at.toISOString(),
  }));

  return <InformasiClient initialPengumuman={serializedPengumuman} />;
}
