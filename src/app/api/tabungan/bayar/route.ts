import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { generateDokuDigest, generateDokuSignature } from "@/lib/doku";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id_rencana_tabungan, bank = "bsi" } = await req.json();

    if (!id_rencana_tabungan) {
      return NextResponse.json({ message: "Missing id_rencana_tabungan" }, { status: 400 });
    }

    const rencana = await prisma.rencanaTabungan.findUnique({
      where: { id: id_rencana_tabungan },
      include: { jamaah: true, paket: true }
    });

    if (!rencana || rencana.jamaah.email !== session.user.email) {
      return NextResponse.json({ message: "Rencana tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    // Hitung cicilan ke berapa
    const riwayatSelesai = await prisma.riwayatSetoran.count({
      where: { id_rencana_tabungan, status_pembayaran: "success" }
    });
    
    const cicilanKe = riwayatSelesai + 1;
    
    if (cicilanKe > rencana.periode_bulan) {
      return NextResponse.json({ message: "Tabungan sudah lunas!" }, { status: 400 });
    }

    // Inisialisasi DOKU API
    const isProd = String(process.env.DOKU_IS_PRODUCTION).toLowerCase() === 'true';
    const baseUrl = isProd ? "https://api.doku.com" : "https://api-sandbox.doku.com";
    const rawClientId = process.env.DOKU_CLIENT_ID || '';
    const rawSecretKey = process.env.DOKU_SECRET_KEY || '';
    const clientId = rawClientId.replace(/"/g, '').trim();
    const secretKey = rawSecretKey.replace(/"/g, '').trim();

    const orderId = `UMR-${rencana.id.substring(0, 8)}-BLN${cicilanKe}-${Date.now()}`;
    const cicilanNominal = Math.round(Number(rencana.setoran_per_bulan));
    const adminNominal = 4440;
    const grossAmount = cicilanNominal + adminNominal;

    const firstName = rencana.jamaah.nama ? rencana.jamaah.nama.trim().substring(0, 50) : 'Jamaah';
    const email = rencana.jamaah.email || 'jamaah@example.com';
    let cleanPhone = rencana.jamaah.no_hp ? rencana.jamaah.no_hp.replace(/[^0-9+\-\s]/g, '').trim() : '';
    if (cleanPhone.length < 5 || cleanPhone.length > 19) {
      cleanPhone = '081234567890';
    }

    if (!clientId) {
       return NextResponse.json({ message: "Gagal memproses pembayaran (DOKU)", detail: { error: "SERVER_ENV_MISSING", message: "DOKU_CLIENT_ID belum terbaca oleh server Vercel. Pastikan redeploy berhasil." } }, { status: 500 });
    }

    // Gunakan URL absolute dari env atau request headers
    const reqHeaders = new Headers(req.headers);
    const host = reqHeaders.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const defaultAppUrl = `${protocol}://${host}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl;

    // Menentukan path DOKU VA API berdasarkan bank yang dipilih
    let targetPath = "/bsm-virtual-account/v2/payment-code"; // Default BSI
    if (bank === "bca") targetPath = "/bca-virtual-account/v2/payment-code";
    else if (bank === "mandiri") targetPath = "/mandiri-virtual-account/v2/payment-code";
    else if (bank === "bri") targetPath = "/bri-virtual-account/v2/payment-code";
    else if (bank === "bni") targetPath = "/bni-virtual-account/v2/payment-code";
    else if (bank === "cimb") targetPath = "/cimb-virtual-account/v2/payment-code";
    else if (bank === "danamon") targetPath = "/danamon-virtual-account/v2/payment-code";

    const body = {
      order: {
        amount: grossAmount,
        invoice_number: orderId
      },
      virtual_account_info: {
        expired_time: 60, // 60 menit
        reusable_status: false,
        info1: "Tabungan Umrah",
        info2: `Cicilan ke-${cicilanKe}`
      },
      customer: {
        name: firstName,
        email: email,
        phone: cleanPhone,
      }
    };

    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().substring(0, 19) + "Z";
    const digest = generateDokuDigest(body);
    const signature = generateDokuSignature(clientId, requestId, requestTimestamp, targetPath, digest, secretKey);

    const response = await fetch(`${baseUrl}${targetPath}`, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
       return NextResponse.json({ message: "Gagal memproses pembayaran (DOKU)", detail: data }, { status: 500 });
    }

    const vaNumber = data.virtual_account_info?.virtual_account_number || null;
    const expiryTime = data.virtual_account_info?.expired_date || null;
    let billerCode = null;

    if (bank === "mandiri") {
        // Jika DOKU mandiri VA, biller code biasanya bisa diambil dari data, atau fix misalnya 89022
        // Kita fallback ke prefix VA mandiri dari DOKU
        billerCode = "89022"; // 89022 adalah Company Code DOKU di Mandiri. Silakan sesuaikan jika beda di production.
        // VA number dari response DOKU kadang sudah mencakup biller code, atau dipisah.
        // DOKU biasanya mengembalikan virtual_account_number lengkap.
    }

    return NextResponse.json({ 
      va_number: vaNumber,
      biller_code: billerCode,
      bank_name: bank,
      order_id: orderId,
      bulan_ke: cicilanKe,
      nominal: cicilanNominal,
      gross_amount: grossAmount,
      expiry_time: expiryTime
    });

  } catch (error: any) {
    console.error("Error creating DOKU payment:", error);
    return NextResponse.json({ message: "Gagal memproses pembayaran (DOKU)", detail: error.message }, { status: 500 });
  }
}
