import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Verifikasi Admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "madinahsalamwisata@gmail.com";
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, nama, email, nik, no_hp, alamat } = body;

    if (!id) {
      return NextResponse.json({ message: "ID Jamaah tidak ditemukan" }, { status: 400 });
    }

    const updatedJamaah = await prisma.jamaah.update({
      where: { id },
      data: {
        nama,
        email,
        nik,
        no_hp,
        alamat
      }
    });

    return NextResponse.json(updatedJamaah);
  } catch (error: any) {
    console.error("Update Jamaah Error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ message: "ID Jamaah wajib diisi" }, { status: 400 });
    }

    // Hindari hapus akun admin
    const target = await prisma.jamaah.findUnique({ where: { id } });
    if (target?.email === "madinahsalamwisata@gmail.com") {
      return NextResponse.json({ message: "Akun administrator utama tidak bisa dihapus!" }, { status: 403 });
    }

    // Pertama, hapus riwayat setoran (jika cascade belum diatur di prisma schema)
    // Prisma schema biasanya butuh onDelete: Cascade, tapi karena belum, kita hapus manual hierarkinya.
    
    // Cari semua Rencana Tabungan milik jamaah ini
    const rencanaTabungan = await prisma.rencanaTabungan.findMany({
      where: { id_jamaah: id },
      select: { id: true }
    });
    const rencanaIds = rencanaTabungan.map(rt => rt.id);

    // Hapus Riwayat Setoran
    if (rencanaIds.length > 0) {
      await prisma.riwayatSetoran.deleteMany({
        where: { id_rencana_tabungan: { in: rencanaIds } }
      });
    }

    // Hapus Rencana Tabungan
    await prisma.rencanaTabungan.deleteMany({
      where: { id_jamaah: id }
    });

    // Akhirnya hapus jamaah
    await prisma.jamaah.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Data jamaah berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete Jamaah Error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
