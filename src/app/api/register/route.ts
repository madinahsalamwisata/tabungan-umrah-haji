import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";



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
        password_plain: password,
      },
    });

    // Return the created user without the password hash
    const { password_hash, ...user } = newUser;

    // Send welcome email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #047857; text-align: center;">Ahlan wa Sahlan, ${nama}!</h2>
        <p>Terima kasih telah mendaftar di <strong>Tabungan Umrah & Haji Madinah Salam Wisata</strong>.</p>
        <p>Akun Anda telah berhasil dibuat dengan detail sebagai berikut:</p>
        <ul>
          <li><strong>Nama Lengkap:</strong> ${nama}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>No. HP/WA:</strong> ${no_hp}</li>
        </ul>
        <p>Sekarang Anda dapat masuk ke dalam dashboard untuk memulai perencanaan tabungan Umrah atau Haji Anda bersama kami.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://tabunganhajiumrahku.com/login" style="background-color: #facc15; color: #064e3b; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Masuk ke Akun Anda</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Jika Anda tidak merasa mendaftar di situs kami, silakan abaikan email ini.
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Pendaftaran Berhasil - Tabungan Umrah & Haji Madinah Salam Wisata",
      html: emailHtml,
    });

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
