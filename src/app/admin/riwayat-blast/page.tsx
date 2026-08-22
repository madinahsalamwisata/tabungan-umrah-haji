import AdminRiwayatBlastClient from "@/components/admin/AdminRiwayatBlastClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRiwayatBlastPage() {
  const riwayat = await prisma.riwayatBlast.findMany({
    include: {
      jamaah: true,
    },
    orderBy: {
      tanggal_kirim: "desc",
    },
  });

  return <AdminRiwayatBlastClient riwayat={riwayat} />;
}
