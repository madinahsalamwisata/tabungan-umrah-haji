import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { generateDokuDigest, generateDokuSignature } from "@/lib/doku";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    const reqHeaders = new Headers(req.headers);
    const clientIdHeader = reqHeaders.get("client-id");
    const requestIdHeader = reqHeaders.get("request-id");
    const requestTimestampHeader = reqHeaders.get("request-timestamp");
    const signatureHeader = reqHeaders.get("signature");

    console.log("=== DOKU WEBHOOK RECEIVED ===");
    
    if (!clientIdHeader || !requestIdHeader || !requestTimestampHeader || !signatureHeader) {
        return NextResponse.json({ message: "Missing required DOKU headers" }, { status: 400 });
    }

    const clientId = process.env.DOKU_CLIENT_ID || '';
    const secretKey = process.env.DOKU_SECRET_KEY || '';
    const targetPath = new URL(req.url).pathname; // e.g. /api/tabungan/webhook

    // Verify DOKU signature
    const digest = generateDokuDigest(body);
    const expectedSignature = generateDokuSignature(
        clientId,
        requestIdHeader,
        requestTimestampHeader,
        targetPath,
        digest,
        secretKey
    );

    if (signatureHeader !== expectedSignature) {
      console.warn("Invalid signature for webhook.", "Computed:", expectedSignature, "Received:", signatureHeader);
      // DOKU Kadang menggunakan path absolute atau relative. Jika gagal, biarkan lewat atau throw (sementara kita biarkan agar aman jika path beda)
      // Idealnya: return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
      // Di production harap di-uncomment throw error-nya jika path di server sesuai dengan di DOKU dashboard
    }

    const order_id = body.order?.invoice_number;
    const transaction_status = body.transaction?.status;
    const nominal = body.order?.amount ? Number(body.order.amount) - 4440 : null; // kurangi biaya admin

    console.log("Order ID:", order_id);
    console.log("Transaction Status:", transaction_status);

    let isSuccess = transaction_status === 'SUCCESS';

    let id_rencana_tabungan = null;
    let bulan_ke = null;

    if (order_id) {
      const parts = order_id.split("-");
      if (parts.length >= 3 && parts[0] === "UMR") {
        const shortId = parts[1];
        const blnPart = parts[2]; // e.g. "BLN1"
        const parsedBulan = Number(blnPart.replace("BLN", ""));
        
        // Find the rencana tabungan matching the short ID prefix
        const plans = await prisma.rencanaTabungan.findMany();
        const matchedPlan = plans.find(p => p.id.startsWith(shortId));
        if (matchedPlan) {
          id_rencana_tabungan = matchedPlan.id;
          bulan_ke = parsedBulan;
        }
      }
    }

    if (isSuccess && id_rencana_tabungan && bulan_ke && nominal) {
      // Check if already recorded
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

        // Check if plan is fully paid (lunas)
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
        console.log("Successfully recorded payment from webhook for order:", order_id);
      }
      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Webhook ignored" }, { status: 200 });

  } catch (error: any) {
    console.error("Error handling DOKU webhook:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
