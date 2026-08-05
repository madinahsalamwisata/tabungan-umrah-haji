import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// Using midtrans-client requires require() as it doesn't have proper types sometimes, or we can use the Midtrans Node API.
const midtransClient = require('midtrans-client');

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

    // Inisialisasi Core API
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY || '';
    const rawClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    const cleanServerKey = rawServerKey.replace(/"/g, '').trim();
    const cleanClientKey = rawClientKey.replace(/"/g, '').trim();
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true' || 
                   (!cleanServerKey.startsWith('SB-') && process.env.MIDTRANS_IS_PRODUCTION !== 'false');

    const core = new midtransClient.CoreApi({
        isProduction : isProd,
        serverKey : cleanServerKey,
        clientKey : cleanClientKey
    });

    const orderId = `UMR-${rencana.id.substring(0, 8)}-BLN${cicilanKe}-${Date.now()}`;
    const cicilanNominal = Math.round(Number(rencana.setoran_per_bulan));
    const adminNominal = 4440;
    const grossAmount = cicilanNominal + adminNominal;

    const namaPaket = rencana.paket?.nama_paket || rencana.paket_snapshot_nama || 'Paket';
    const prefix = "Cicilan Umrah ";
    const suffix = ` Bulan ke-${cicilanKe}`;
    const maxNamaLength = 50 - prefix.length - suffix.length;
    const item1Name = `${prefix}${namaPaket.substring(0, maxNamaLength)}${suffix}`;

    // Construct bank transfer parameter based on chosen bank
    let paymentParams: any = {
        "transaction_details": {
            "order_id": orderId,
            "gross_amount": grossAmount
        },
        "item_details": [
            {
                "id": `CICILAN-${cicilanKe}`,
                "price": cicilanNominal,
                "quantity": 1,
                "name": item1Name
            },
            {
                "id": "ADMIN-FEE",
                "price": adminNominal,
                "quantity": 1,
                "name": "Biaya Admin Payment Gateway Midtrans"
            }
        ],
        "customer_details": {
            "first_name": rencana.jamaah.nama,
            "email": rencana.jamaah.email,
            "phone": rencana.jamaah.no_hp
        },
        "custom_field1": rencana.id,
        "custom_field2": String(cicilanKe),
        "custom_field3": String(cicilanNominal)
    };

    if (bank === "mandiri") {
        paymentParams.payment_type = "echannel";
        paymentParams.echannel = {
            "bill_info1": "Pembayaran",
            "bill_info2": "Cicilan Tabungan"
        };
    } else {
        paymentParams.payment_type = "bank_transfer";
        paymentParams.bank_transfer = {
            "bank": bank
        };
    }

    const transaction = await core.charge(paymentParams);

    return NextResponse.json({ 
      va_number: transaction.va_numbers?.[0]?.va_number || transaction.permata_va_number || transaction.bill_key || null,
      biller_code: transaction.biller_code || null,
      bank_name: bank,
      order_id: orderId,
      bulan_ke: cicilanKe,
      nominal: cicilanNominal,
      gross_amount: grossAmount,
      expiry_time: transaction.expiry_time || null
    });

  } catch (error: any) {
    console.error("Error creating snap token:", error);
    const detail = error.ApiResponse ? error.ApiResponse : error.message;
    return NextResponse.json({ message: "Gagal memproses pembayaran (Midtrans)", detail }, { status: 500 });
  }
}
