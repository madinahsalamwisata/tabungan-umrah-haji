import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Paksa buat kolom di database produksi (Vercel) menggunakan eksekusi SQL mentah
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Jamaah" ADD COLUMN IF NOT EXISTS "reset_token" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Jamaah" ADD COLUMN IF NOT EXISTS "reset_token_expiry" TIMESTAMP(3);`);
    } catch (sqlError) {
      console.error("SQL Alter Table Error (mungkin sudah ada):", sqlError);
    }

    const hash = await bcrypt.hash('MSwisata2024', 10);
    
    // Pastikan admin ada
    const existing = await prisma.jamaah.findUnique({
      where: { email: 'madinahsalamwisata@gmail.com' }
    });

    if (!existing) {
      // Buat kalau belum ada
      await prisma.jamaah.create({
        data: {
          nama: 'Administrator',
          email: 'madinahsalamwisata@gmail.com',
          no_hp: '080000000000',
          nik: '0000000000000000',
          password_hash: hash,
          alamat: 'Sistem Pusat Madinah Salam Wisata',
        }
      });
      return NextResponse.json({ message: 'Admin tidak ditemukan, jadi telah dibuat ulang dengan password: MSwisata2024' });
    }

    // Reset kalau ada
    await prisma.jamaah.update({
      where: { email: 'madinahsalamwisata@gmail.com' },
      data: { password_hash: hash }
    });

    return NextResponse.json({ message: 'Berhasil! Password admin telah di-reset kembali menjadi: MSwisata2024' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
