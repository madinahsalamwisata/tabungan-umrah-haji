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
    const paket = await prisma.paket.findMany({
      orderBy: { tanggal_keberangkatan: 'asc' }
    });
    return NextResponse.json(paket);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const newPaket = await prisma.paket.create({
      data: {
        nama_paket: body.nama_paket,
        tanggal_keberangkatan: new Date(body.tanggal_keberangkatan),
        tanggal_kepulangan: new Date(body.tanggal_kepulangan),
        hotel_makkah: body.hotel_makkah,
        hotel_madinah: body.hotel_madinah,
        maskapai: body.maskapai,
        harga_quad: body.harga_quad,
        harga_double: body.harga_double,
        harga_triple: body.harga_triple,
        kuota: parseInt(body.kuota),
        deskripsi_fasilitas: body.deskripsi_fasilitas,
        poster_url: body.poster_url || null,
        is_estimasi: body.is_estimasi || false
      }
    });

    return NextResponse.json(newPaket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ message: "ID Paket wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.paket.update({
      where: { id: body.id },
      data: {
        nama_paket: body.nama_paket,
        tanggal_keberangkatan: new Date(body.tanggal_keberangkatan),
        tanggal_kepulangan: new Date(body.tanggal_kepulangan),
        hotel_makkah: body.hotel_makkah,
        hotel_madinah: body.hotel_madinah,
        maskapai: body.maskapai,
        harga_quad: body.harga_quad,
        harga_double: body.harga_double,
        harga_triple: body.harga_triple,
        kuota: parseInt(body.kuota),
        deskripsi_fasilitas: body.deskripsi_fasilitas,
        poster_url: body.poster_url || null,
        is_estimasi: body.is_estimasi || false
      }
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

    // Cek jika ada Rencana Tabungan yang terhubung
    const connected = await prisma.rencanaTabungan.count({
      where: { id_paket: id }
    });

    if (connected > 0) {
      return NextResponse.json({ message: `Gagal menghapus: Ada ${connected} jamaah yang terdaftar dalam paket ini!` }, { status: 400 });
    }

    await prisma.paket.delete({ where: { id } });

    return NextResponse.json({ message: "Paket berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
