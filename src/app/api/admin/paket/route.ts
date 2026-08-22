import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "madinahsalamwisata@gmail.com";
}

export async function GET() {
  try {
    const paket = await prisma.paket.findMany({
      orderBy: { tanggal_keberangkatan: 'asc' },
      include: {
        RencanaTabungan: {
          include: {
            jamaah: true,
            RiwayatSetoran: true
          }
        }
      }
    });

    const serialized = paket.map(p => ({
      id: p.id,
      nama_paket: p.nama_paket,
      tanggal_keberangkatan: p.tanggal_keberangkatan.toISOString(),
      tanggal_kepulangan: p.tanggal_kepulangan.toISOString(),
      hotel_makkah: p.hotel_makkah,
      hotel_madinah: p.hotel_madinah,
      maskapai: p.maskapai,
      harga_quad: Number(p.harga_quad),
      harga_double: Number(p.harga_double),
      harga_triple: Number(p.harga_triple),
      kuota: p.kuota,
      deskripsi_fasilitas: p.deskripsi_fasilitas,
      poster_url: p.poster_url,
      is_estimasi: p.is_estimasi,
      is_deleted: p.is_deleted,
      peminat: p.RencanaTabungan.map(rt => {
        const successfulPayments = rt.RiwayatSetoran
          .filter(rs => rs.status_pembayaran === 'Lunas' || rs.status_pembayaran === 'settlement' || rs.status_pembayaran === 'success');
        
        const totalTerkumpul = successfulPayments.reduce((sum, rs) => sum + Number(rs.nominal), 0);

        const totalRefund = rt.RiwayatSetoran
          .filter(rs => rs.status_pembayaran === 'refund')
          .reduce((sum, rs) => sum + Math.abs(Number(rs.nominal)), 0);

        const bulanTerbayar = successfulPayments.length;
        const sisaBulan = Math.max(0, rt.periode_bulan - bulanTerbayar);

        return {
          jamaah_id: rt.jamaah.id,
          nama: rt.jamaah.nama,
          email: rt.jamaah.email,
          no_hp: rt.jamaah.no_hp,
          nik: rt.jamaah.nik,
          foto_url: rt.jamaah.foto_url,
          jenis_kamar: rt.jenis_kamar,
          status_rencana: rt.status,
          setoran_terkumpul: totalTerkumpul - totalRefund,
          total_biaya: Number(rt.total_biaya),
          periode_bulan: rt.periode_bulan,
          bulan_terbayar: bulanTerbayar,
          sisa_bulan: sisaBulan
        };
      })
    }));

    return NextResponse.json(serialized);
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

    // Cek jika ada Rencana Tabungan yang masih Aktif terhubung dengan paket ini
    const connected = await prisma.rencanaTabungan.count({
      where: { id_paket: id, status: "Aktif" }
    });

    if (connected > 0) {
      return NextResponse.json({ message: `Gagal menghapus: Ada ${connected} jamaah aktif yang terdaftar dalam paket ini!` }, { status: 400 });
    }

    await prisma.paket.update({ where: { id }, data: { is_deleted: true } });

    return NextResponse.json({ message: "Paket berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
