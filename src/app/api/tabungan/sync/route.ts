import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const midtransClient = require('midtrans-client');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let { order_id, id_rencana_tabungan, bulan_ke, nominal } = await req.json();

    if (!order_id) {
      return NextResponse.json({ message: "Order ID tidak boleh kosong" }, { status: 400 });
    }

    // Fallback: Parse details from order_id if they are missing
    if (!id_rencana_tabungan || !bulan_ke || !nominal) {
      const parts = order_id.split("-");
      if (parts.length >= 3 && parts[0] === "UMR") {
        const shortId = parts[1];
        const blnPart = parts[2]; // e.g. "BLN1"
        const parsedBulan = Number(blnPart.replace("BLN", ""));
        
        // Find the plans in DB and match by short ID prefix
        const plans = await prisma.rencanaTabungan.findMany();
        const matchedPlan = plans.find(p => p.id.startsWith(shortId));
        if (matchedPlan) {
          id_rencana_tabungan = matchedPlan.id;
          bulan_ke = parsedBulan;
          nominal = Math.round(Number(matchedPlan.setoran_per_bulan));
        }
      }
    }

    if (!id_rencana_tabungan || !bulan_ke || !nominal) {
      return NextResponse.json({ message: "Gagal mencocokkan data rencana tabungan untuk Order ID ini" }, { status: 400 });
    }

    // Periksa ke Midtrans langsung
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY || '';
    const rawClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    const cleanServerKey = rawServerKey.replace(/"/g, '').trim();
    const cleanClientKey = rawClientKey.replace(/"/g, '').trim();
    const isProd = !cleanServerKey.startsWith('SB-');

    const core = new midtransClient.CoreApi({
      isProduction: isProd,
      serverKey: cleanServerKey,
      clientKey: cleanClientKey
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
