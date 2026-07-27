import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "madinahsalamwisata@gmail.com";
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rencanaTabunganId, amount } = body;

    if (!rencanaTabunganId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ message: "ID Rencana Tabungan dan jumlah refund valid wajib diisi" }, { status: 400 });
    }

    const rencana = await prisma.rencanaTabungan.findUnique({
      where: { id: rencanaTabunganId },
      include: { RiwayatSetoran: true }
    });

    if (!rencana) {
      return NextResponse.json({ message: "Rencana tabungan tidak ditemukan" }, { status: 404 });
    }

    // Get the next bulan_ke index or set it to 0
    const nextBulanKe = rencana.RiwayatSetoran.length + 1;

    // Create a new RiwayatSetoran with negative nominal representing the refund
    const newSetoran = await prisma.riwayatSetoran.create({
      data: {
        id_rencana_tabungan: rencanaTabunganId,
        bulan_ke: nextBulanKe,
        tanggal_setor: new Date(),
        nominal: -Number(amount),
        status_pembayaran: "refund"
      }
    });

    return NextResponse.json({
      message: "Refund berhasil dicatat",
      transaction: {
        id: newSetoran.id,
        bulan_ke: newSetoran.bulan_ke,
        tanggal_setor: newSetoran.tanggal_setor.toISOString(),
        nominal: Number(newSetoran.nominal),
        status_pembayaran: newSetoran.status_pembayaran
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Refund API Error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
