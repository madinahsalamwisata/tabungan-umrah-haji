import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const jamaah = await prisma.jamaah.findUnique({
      where: { email: session.user.email },
    });

    if (!jamaah) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { paketId, jenisKamar, durasiBulan, totalBiaya, setoranPerBulan } = data;

    if (!paketId || !jenisKamar || !durasiBulan || !totalBiaya || !setoranPerBulan) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const rencanaTabungan = await prisma.rencanaTabungan.create({
      data: {
        id_jamaah: jamaah.id,
        id_paket: paketId,
        jenis_kamar: jenisKamar,
        periode_bulan: durasiBulan,
        total_biaya: totalBiaya,
        setoran_per_bulan: setoranPerBulan,
        tanggal_mulai: new Date(),
        status: "Aktif",
      },
    });

    return NextResponse.json(
      { message: "Rencana tabungan berhasil dibuat", data: rencanaTabungan },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tabungan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
