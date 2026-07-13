import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    // 1. Cek apakah email terdaftar
    const jamaah = await prisma.jamaah.findUnique({
      where: { email },
    });

    if (!jamaah) {
      // Return success even if email not found for security (prevent email enumeration)
      // but in this case, for better UX we might want to return an error
      return NextResponse.json(
        { error: "Email tidak ditemukan di sistem kami." },
        { status: 404 }
      );
    }

    // 2. Buat token unik
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    // 3. Simpan token ke database
    await prisma.jamaah.update({
      where: { id: jamaah.id },
      data: {
        // @ts-ignore
        reset_token: resetToken,
        // @ts-ignore
        reset_token_expiry: tokenExpiry,
      },
    });

    // 4. Siapkan URL reset
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // 5. Konfigurasi Nodemailer (Akan berfungsi jika env variables diset)
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Madinah Salam Wisata" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Pemulihan Kata Sandi - Madinah Salam Wisata",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #065f46; text-align: center;">Pemulihan Kata Sandi</h2>
            <p>Halo <strong>${jamaah.nama}</strong>,</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di aplikasi Tabungan Umrah & Haji Madinah Salam Wisata.</p>
            <p>Silakan klik tombol di bawah ini untuk membuat kata sandi baru. Tautan ini hanya berlaku selama 1 jam.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #facc15; color: #064e3b; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Kata Sandi</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Jika Anda tidak meminta reset kata sandi, abaikan email ini. Akun Anda tetap aman.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Madinah Salam Wisata.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      // Jika SMTP belum disetting, kita cetak URL di console (untuk testing)
      console.log("==========================================");
      console.log("SMTP BELUM DIKONFIGURASI!");
      console.log(`Buka URL ini untuk reset password ${email}:`);
      console.log(resetUrl);
      console.log("==========================================");
    }

    return NextResponse.json({
      message: "Tautan pemulihan kata sandi telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Lupa password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
