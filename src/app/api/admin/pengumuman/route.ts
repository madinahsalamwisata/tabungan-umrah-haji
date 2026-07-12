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
    const pengumuman = await prisma.pengumuman.findMany({
      orderBy: { created_at: "desc" }
    });
    return NextResponse.json(pengumuman);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { judul, konten, is_penting } = await req.json();

    if (!judul || !konten) {
      return NextResponse.json({ message: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const newPengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        konten,
        is_penting: is_penting || false
      }
    });

    return NextResponse.json(newPengumuman, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, judul, konten, is_penting } = await req.json();

    if (!id || !judul || !konten) {
      return NextResponse.json({ message: "ID, Judul, dan konten wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.pengumuman.update({
      where: { id },
      data: { judul, konten, is_penting }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
    }

    await prisma.pengumuman.delete({ where: { id } });

    return NextResponse.json({ message: "Pengumuman dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
