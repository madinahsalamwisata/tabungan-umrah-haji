import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const midtransClient = require('midtrans-client');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { order_id, id_rencana_tabungan, bulan_ke, nominal } = await req.json();

    if (!order_id || !id_rencana_tabungan || !bulan_ke || !nominal) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Periksa ke Midtrans langsung
    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    const statusResponse = await core.transaction.status(order_id);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let isSuccess = false;

    if (transactionStatus == 'capture'){
        if (fraudStatus == 'challenge'){
            // TODO set transaction status on your database to 'challenge'
        } else if (fraudStatus == 'accept'){
            isSuccess = true;
        }
    } else if (transactionStatus == 'settlement'){
        isSuccess = true;
    }

    if (isSuccess) {
      // Cek apakah sudah dicatat
      const existing = await prisma.riwayatSetoran.findFirst({
        where: { id_transaksi_gateway: order_id }
      });

      if (!existing) {
        await prisma.riwayatSetoran.create({
          data: {
            id_rencana_tabungan,
            bulan_ke,
            tanggal_setor: new Date(),
            nominal,
            status_pembayaran: "success",
            id_transaksi_gateway: order_id
          }
        });

        // Cek lunas
        const rencana = await prisma.rencanaTabungan.findUnique({
            where: { id: id_rencana_tabungan }
        });
        
        if (rencana) {
           const allRiwayat = await prisma.riwayatSetoran.findMany({
               where: { id_rencana_tabungan, status_pembayaran: "success" }
           });
           
           const totalTerkumpul = allRiwayat.reduce((sum, item) => sum + Number(item.nominal), 0);
           if (totalTerkumpul >= Number(rencana.total_biaya)) {
               await prisma.rencanaTabungan.update({
                   where: { id: id_rencana_tabungan },
                   data: { status: "Lunas" }
               });
           }
        }
      }
      return NextResponse.json({ status: "success", message: "Pembayaran berhasil diverifikasi" });
    }

    return NextResponse.json({ status: "pending", message: "Pembayaran belum selesai atau pending" });

  } catch (error: any) {
    console.error("Error syncing tabungan:", error);
    // Jika API Midtrans not found (misal belum terbuat di Midtrans karena user langsung close), kita anggap pending
    return NextResponse.json({ status: "pending", message: "Gagal memverifikasi", detail: error.message });
  }
}
