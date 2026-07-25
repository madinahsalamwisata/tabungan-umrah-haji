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
    id: rencana.id,
    id_jamaah: rencana.id_jamaah,
    id_paket: rencana.id_paket,
    jenis_kamar: rencana.jenis_kamar,
    jumlah_jamaah: rencana.jumlah_jamaah,
    periode_bulan: rencana.periode_bulan,
    status: rencana.status,
    paket_snapshot_nama: rencana.paket_snapshot_nama,
    paket_snapshot_is_estimasi: rencana.paket_snapshot_is_estimasi,
    paket_snapshot_maskapai: rencana.paket_snapshot_maskapai,
    tanggal_mulai: rencana.tanggal_mulai ? new Date(rencana.tanggal_mulai).toISOString() : null,
    paket_snapshot_tanggal_berangkat: rencana.paket_snapshot_tanggal_berangkat ? new Date(rencana.paket_snapshot_tanggal_berangkat).toISOString() : null,
    paket_snapshot_tanggal_kepulangan: rencana.paket_snapshot_tanggal_kepulangan ? new Date(rencana.paket_snapshot_tanggal_kepulangan).toISOString() : null,
    total_biaya: rencana.total_biaya.toString(),
    setoran_per_bulan: rencana.setoran_per_bulan.toString(),
    paket: rencana.paket ? {
      id: rencana.paket.id,
      nama_paket: rencana.paket.nama_paket,
      tanggal_keberangkatan: rencana.paket.tanggal_keberangkatan ? new Date(rencana.paket.tanggal_keberangkatan).toISOString() : null,
      tanggal_kepulangan: rencana.paket.tanggal_kepulangan ? new Date(rencana.paket.tanggal_kepulangan).toISOString() : null,
      hotel_makkah: rencana.paket.hotel_makkah,
      hotel_madinah: rencana.paket.hotel_madinah,
      maskapai: rencana.paket.maskapai,
      harga_quad: rencana.paket.harga_quad.toString(),
      harga_triple: rencana.paket.harga_triple.toString(),
      harga_double: rencana.paket.harga_double.toString(),
      kuota: rencana.paket.kuota,
      deskripsi_fasilitas: rencana.paket.deskripsi_fasilitas,
      poster_url: rencana.paket.poster_url,
      is_estimasi: rencana.paket.is_estimasi,
    } : null,
    RiwayatSetoran: rencana.RiwayatSetoran.map((r: any) => ({
      id: r.id,
      id_rencana_tabungan: r.id_rencana_tabungan,
      bulan_ke: r.bulan_ke,
      status_pembayaran: r.status_pembayaran,
      id_transaksi_gateway: r.id_transaksi_gateway,
      tanggal_setor: r.tanggal_setor ? new Date(r.tanggal_setor).toISOString() : null,
      nominal: r.nominal.toString()
    }))
  }));

  return <RiwayatTabunganClient riwayatList={serializedList} />;
}
