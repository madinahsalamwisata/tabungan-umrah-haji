import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Tidak sah (Unauthorized)" }, { status: 401 });
    }

    const body = await req.json();
    const { passwordSekarang, passwordBaru } = body;

    if (!passwordSekarang || !passwordBaru) {
      return NextResponse.json({ message: "Semua field password harus diisi" }, { status: 400 });
    }

    if (passwordBaru.length < 6) {
      return NextResponse.json({ message: "Password baru minimal harus 6 karakter" }, { status: 400 });
    }

    // Pastikan user exists
    const currentUser = await prisma.jamaah.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Bandingkan password sekarang dengan hash di database
    const isPasswordValid = await bcrypt.compare(passwordSekarang, currentUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(passwordBaru, 10);

    // Update password_hash dan password_plain di database
    await prisma.jamaah.update({
      where: { email: session.user.email },
      data: {
        password_hash: hashedNewPassword,
        password_plain: passwordBaru
      },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" }, { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem saat memperbarui password" }, { status: 500 });
  }
}
