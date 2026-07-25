import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jamaah = await prisma.jamaah.findUnique({
      where: { email: session.user.email },
    });

    if (!jamaah) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const { id } = await req.json();

    const rencana = await prisma.rencanaTabungan.findUnique({
      where: { id },
    });

    if (!rencana || rencana.id_jamaah !== jamaah.id) {
      return NextResponse.json({ message: "Rencana tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    await prisma.$transaction(async (tx: any) => {
      // Kembalikan kuota paket jika paket masih ada (id_paket tidak null)
      if (rencana.id_paket) {
        await tx.paket.update({
          where: { id: rencana.id_paket },
          data: { kuota: { increment: rencana.jumlah_jamaah } }
        });
      }

      // Ubah status rencana menjadi Dibatalkan
      await tx.rencanaTabungan.update({
        where: { id },
        data: { status: "Dibatalkan" }
      });
    });

    return NextResponse.json({ message: "Berhasil dibatalkan" }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting rencana:", error);
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}
