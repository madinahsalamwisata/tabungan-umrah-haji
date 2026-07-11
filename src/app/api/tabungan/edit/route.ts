import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jamaah = await prisma.jamaah.findUnique({
      where: { email: session.user.email },
    });

    if (!jamaah) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const { id, jenis_kamar, jumlah_jamaah } = await req.json();

    const rencana = await prisma.rencanaTabungan.findUnique({
      where: { id },
      include: { paket: true }
    });

    if (!rencana || rencana.id_jamaah !== jamaah.id) {
      return NextResponse.json({ message: "Rencana tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    // Hitung ulang harga
    let hargaPerOrang = 0;
    if (jenis_kamar === "Quad") hargaPerOrang = Number(rencana.paket.harga_quad);
    else if (jenis_kamar === "Triple") hargaPerOrang = Number(rencana.paket.harga_triple);
    else if (jenis_kamar === "Double") hargaPerOrang = Number(rencana.paket.harga_double);

    const totalBiayaBaru = hargaPerOrang * Number(jumlah_jamaah);
    const setoranBulananBaru = Math.ceil(totalBiayaBaru / rencana.periode_bulan);

    const difference = Number(jumlah_jamaah) - rencana.jumlah_jamaah;
    if (difference > 0) {
      if (rencana.paket.kuota < difference) {
         return NextResponse.json({ message: "Sisa kuota paket tidak mencukupi untuk penambahan jamaah" }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const res = await tx.rencanaTabungan.update({
        where: { id },
        data: {
          jenis_kamar,
          jumlah_jamaah: Number(jumlah_jamaah),
          total_biaya: totalBiayaBaru,
          setoran_per_bulan: setoranBulananBaru
        }
      });
      
      if (difference !== 0) {
        await tx.paket.update({
          where: { id: rencana.id_paket },
          data: { kuota: { decrement: difference } } 
        });
      }
      
      return res;
    });

    return NextResponse.json({ message: "Berhasil diperbarui", data: updated }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating rencana:", error);
    return NextResponse.json({ message: "Terjadi kesalahan", error: error.message }, { status: 500 });
  }
}
