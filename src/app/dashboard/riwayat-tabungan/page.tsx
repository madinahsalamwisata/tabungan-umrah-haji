import RiwayatTabunganClient from "./RiwayatTabunganClient";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Riwayat Tabungan Umrah & Haji | Tabungan Umrah & Haji",
};

export default async function RiwayatTabunganPage() {
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

  const riwayatList = await prisma.rencanaTabungan.findMany({
    where: { 
      id_jamaah: jamaah.id,
      status: { in: ["Lunas", "Dibatalkan"] }
    },
    include: {
      paket: true,
      RiwayatSetoran: {
        orderBy: { bulan_ke: 'asc' }
      }
    },
    orderBy: { tanggal_mulai: 'desc' }
  });

  const serializedList = riwayatList.map((rencana: any) => ({
    ...rencana,
    tanggal_mulai: rencana.tanggal_mulai ? new Date(rencana.tanggal_mulai).toISOString() : null,
    paket_snapshot_tanggal_berangkat: rencana.paket_snapshot_tanggal_berangkat ? new Date(rencana.paket_snapshot_tanggal_berangkat).toISOString() : null,
    paket_snapshot_tanggal_kepulangan: rencana.paket_snapshot_tanggal_kepulangan ? new Date(rencana.paket_snapshot_tanggal_kepulangan).toISOString() : null,
    total_biaya: rencana.total_biaya.toString(),
    setoran_per_bulan: rencana.setoran_per_bulan.toString(),
    paket: rencana.paket ? {
      ...rencana.paket,
      tanggal_keberangkatan: rencana.paket.tanggal_keberangkatan ? new Date(rencana.paket.tanggal_keberangkatan).toISOString() : null,
      tanggal_kepulangan: rencana.paket.tanggal_kepulangan ? new Date(rencana.paket.tanggal_kepulangan).toISOString() : null,
      harga_quad: rencana.paket.harga_quad.toString(),
      harga_triple: rencana.paket.harga_triple.toString(),
      harga_double: rencana.paket.harga_double.toString(),
    } : null,
    RiwayatSetoran: rencana.RiwayatSetoran.map((r: any) => ({
      ...r,
      tanggal_setor: r.tanggal_setor ? new Date(r.tanggal_setor).toISOString() : null,
      nominal: r.nominal.toString()
    }))
  }));

  return <RiwayatTabunganClient riwayatList={serializedList} />;
}
