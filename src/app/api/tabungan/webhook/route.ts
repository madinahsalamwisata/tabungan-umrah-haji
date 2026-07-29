import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1,
      custom_field2,
      custom_field3
    } = body;

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Order ID:", order_id);
    console.log("Status Code:", status_code);
    console.log("Gross Amount:", gross_amount);
    console.log("Transaction Status:", transaction_status);
    console.log("Signature Key from payload:", signature_key);

    const rawServerKey = process.env.MIDTRANS_SERVER_KEY || '';
    const cleanServerKey = rawServerKey.replace(/"/g, '').trim();

    // Verify signature to ensure it's from Midtrans
    const payload = order_id + status_code + gross_amount + cleanServerKey;
    const computedSignature = crypto.createHash("sha512").update(payload).digest("hex");

    console.log("Computed Signature:", computedSignature);

    if (computedSignature !== signature_key) {
      console.warn("Invalid signature for webhook order:", order_id, "Computed signature:", computedSignature, "Received:", signature_key);
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    let isSuccess = false;
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        isSuccess = true;
      }
    } else if (transaction_status === 'settlement') {
      isSuccess = true;
    }

    let id_rencana_tabungan = custom_field1 || null;
    let bulan_ke = custom_field2 ? Number(custom_field2) : null;
    let nominal = custom_field3 ? Number(custom_field3) : null;

    // Fallback: Parse from order_id if custom fields are missing
    if ((!id_rencana_tabungan || !bulan_ke) && order_id) {
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
          nominal = Math.round(Number(matchedPlan.setoran_per_bulan));
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
    console.error("Error handling Midtrans webhook:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
