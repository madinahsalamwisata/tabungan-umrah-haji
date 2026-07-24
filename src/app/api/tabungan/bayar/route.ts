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

    const { id_rencana_tabungan } = await req.json();

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

    // Inisialisasi Snap
    const snap = new midtransClient.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    const orderId = `UMR-${rencana.id.substring(0, 8)}-BLN${cicilanKe}-${Date.now()}`;
    let nominal = Math.round(Number(rencana.setoran_per_bulan));
    if (cicilanKe === 1) {
        nominal += 500000;
    }

    const parameter = {
        "transaction_details": {
            "order_id": orderId,
            "gross_amount": nominal
        },
        "item_details": [{
            "id": `CICILAN-${cicilanKe}`,
            "price": nominal,
            "quantity": 1,
            "name": `Setoran Ke-${cicilanKe} Paket ${rencana.paket.nama_paket.substring(0, 30)}`
        }],
        "customer_details": {
            "first_name": rencana.jamaah.nama,
            "email": rencana.jamaah.email,
            "phone": rencana.jamaah.no_hp
        }
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ 
      token: transaction.token,
      order_id: orderId,
      bulan_ke: cicilanKe,
      nominal: nominal
    });

  } catch (error: any) {
    console.error("Error creating snap token:", error);
    const detail = error.ApiResponse ? error.ApiResponse : error.message;
    return NextResponse.json({ message: "Gagal memproses pembayaran (Midtrans)", detail }, { status: 500 });
  }
}
