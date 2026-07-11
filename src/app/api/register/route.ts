import { NextResponse } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, no_hp, nik, password } = body;

    if (!nama || !email || !no_hp || !nik || !password) {
      return Response.json(
        { message: "Semua field (nama, email, no hp, nik, password) wajib diisi" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.jamaah.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return Response.json(
        { message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Check if nik already exists
    const existingUserByNik = await prisma.jamaah.findUnique({
      where: { nik },
    });

    if (existingUserByNik) {
      return Response.json(
        { message: "NIK sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.jamaah.create({
      data: {
        nama,
        email,
        no_hp,
        nik,
        alamat: "", // Default to empty string since database still enforces NOT NULL
        password_hash: hashedPassword,
      },
    });

    // Return the created user without the password hash
    const { password_hash, ...user } = newUser;

    return Response.json(
      { message: "Registrasi berhasil", user },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
