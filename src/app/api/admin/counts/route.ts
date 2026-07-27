import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "madinahsalamwisata@gmail.com";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jamaahCount = await prisma.jamaah.count({
      where: { email: { not: "madinahsalamwisata@gmail.com" } }
    });

    const pengumumanCount = await prisma.pengumuman.count();

    return NextResponse.json({
      jamaah: jamaahCount,
      pengumuman: pengumumanCount
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
