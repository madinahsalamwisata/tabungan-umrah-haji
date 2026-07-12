import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Tidak memiliki akses" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "File foto tidak ditemukan" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Format foto harus JPG, PNG, atau WEBP" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.name.split(".").pop();
    const filename = `avatar-${session.user.email.split('@')[0]}-${uniqueSuffix}.${extension}`;

    // Define upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // ignore if exists
    }

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/profiles/${filename}`;

    // Update database
    await prisma.jamaah.update({
      where: { email: session.user.email },
      data: { foto_url: publicUrl },
    });

    return NextResponse.json({ 
      message: "Foto berhasil diunggah", 
      url: publicUrl 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Gagal mengunggah foto: " + error.message }, { status: 500 });
  }
}
