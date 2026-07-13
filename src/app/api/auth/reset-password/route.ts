import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token dan kata sandi baru wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Cari jamaah dengan token yang cocok dan belum expired
    const jamaah = await prisma.jamaah.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gte: new Date(), // Pastikan token expiry masih lebih besar dari waktu sekarang
        },
      },
    });

    if (!jamaah) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password dan hapus token
    await prisma.jamaah.update({
      where: { id: jamaah.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null, // Hapus token setelah digunakan
        reset_token_expiry: null,
      },
    });

    return NextResponse.json({
      message: "Kata sandi berhasil diperbarui",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
