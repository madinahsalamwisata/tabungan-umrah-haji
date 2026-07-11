import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Tidak sah (Unauthorized)" }, { status: 401 });
    }

    const body = await req.json();
    const { nama, no_hp, nik, alamat } = body;

    // Pastikan user exists
    const currentUser = await prisma.jamaah.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Jika NIK diubah, pastikan tidak digunakan orang lain
    if (nik !== currentUser.nik) {
      const existingNik = await prisma.jamaah.findUnique({
        where: { nik },
      });

      if (existingNik) {
        return NextResponse.json({ message: "NIK sudah digunakan oleh pengguna lain" }, { status: 409 });
      }
    }

    const updatedUser = await prisma.jamaah.update({
      where: { email: session.user.email },
      data: {
        nama: nama || currentUser.nama,
        no_hp: no_hp || currentUser.no_hp,
        nik: nik || currentUser.nik,
        alamat: alamat !== undefined ? alamat : currentUser.alamat,
      },
    });

    // Don't send the password back
    const { password_hash, ...safeUser } = updatedUser;

    return NextResponse.json({ message: "Profil berhasil diperbarui", user: safeUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem saat memperbarui profil" }, { status: 500 });
  }
}
