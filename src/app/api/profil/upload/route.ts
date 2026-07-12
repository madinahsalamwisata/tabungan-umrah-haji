import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Convert file to base64 data URI to avoid local filesystem issues on Vercel/serverless
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Update database
    await prisma.jamaah.update({
      where: { email: session.user.email },
      data: { foto_url: dataURI },
    });

    return NextResponse.json({ 
      message: "Foto berhasil diunggah", 
      url: dataURI 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Gagal mengunggah foto: " + error.message }, { status: 500 });
  }
}
