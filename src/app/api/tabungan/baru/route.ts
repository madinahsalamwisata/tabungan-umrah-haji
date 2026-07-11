import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
        { message: "Jamaah tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { id_paket, jenis_kamar, jumlah_jamaah, durasi_bulan, total_biaya, setoran_bulanan } = data;

    if (!id_paket || !jenis_kamar || !durasi_bulan || !total_biaya || !setoran_bulanan) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const existing = await prisma.rencanaTabungan.findFirst({
        where: { id_jamaah: jamaah.id, id_paket: id_paket, status: { in: ["Aktif", "Lunas"] } }
    });

    if (existing) {
        return NextResponse.json({ message: "Anda sudah memiliki rencana tabungan aktif untuk paket ini" }, { status: 400 });
    }

    const rencanaTabungan = await prisma.rencanaTabungan.create({
      data: {
        id_jamaah: jamaah.id,
        id_paket: id_paket,
        jenis_kamar: jenis_kamar,
        jumlah_jamaah: jumlah_jamaah || 1,
        periode_bulan: Number(durasi_bulan),
        total_biaya: Number(total_biaya),
        setoran_per_bulan: Number(setoran_bulanan),
        tanggal_mulai: new Date(),
        status: "Aktif",
      },
    });

    return NextResponse.json(
      { message: "Rencana tabungan berhasil dibuat", data: rencanaTabungan },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating rencana tabungan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}
