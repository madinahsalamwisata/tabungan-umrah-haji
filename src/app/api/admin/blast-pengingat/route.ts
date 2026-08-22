import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { konten } = body;

    if (!konten) {
      return NextResponse.json({ message: "Konten pengumuman wajib diisi" }, { status: 400 });
    }

    const judul = "Pengingat Pembayaran Cicilan Tabungan";
    const is_penting = true;
    const is_pinned = true;

    // Create the announcement so it appears in the dashboard
    await prisma.pengumuman.create({
      data: {
        judul,
        konten,
        is_penting,
        is_pinned,
      }
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthString = `${monthNames[currentMonth]} ${currentYear}`;

    // Get active plans
    const activePlans = await prisma.rencanaTabungan.findMany({
      where: { status: "Aktif" },
      include: { jamaah: true, RiwayatSetoran: true, paket: true },
    });

    let sentCount = 0;
    for (const plan of activePlans) {
      if (!plan.jamaah?.email) continue;

      const hasPaidThisMonth = plan.RiwayatSetoran.some((setoran) => {
        const setoranDate = new Date(setoran.tanggal_setor);
        return (
          setoranDate.getMonth() === currentMonth &&
          setoranDate.getFullYear() === currentYear &&
          setoran.status_pembayaran === "Sukses"
        );
      });

      if (!hasPaidThisMonth) {
        const setoranFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(plan.setoran_per_bulan));
        
        // Convert simple markdown to HTML line breaks for email
        const formattedKonten = konten.replace(/\n/g, '<br>');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #064e3b; text-align: center;">${judul}</h2>
            <p>Assalamu'alaikum Wr. Wb. Bapak/Ibu <strong>${plan.jamaah.nama}</strong>,</p>
            <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #059669; background-color: #f0fdf4;">
              ${formattedKonten}
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">Detail Tagihan Anda:</h3>
              <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 8px;"><strong>Paket:</strong> ${plan.paket?.nama_paket || plan.paket_snapshot_nama || "Paket Umrah/Haji"}</li>
                <li style="margin-bottom: 8px;"><strong>Bulan Tagihan:</strong> ${monthString}</li>
                <li style="margin-bottom: 8px;"><strong>Jumlah yang harus dibayar:</strong> <span style="color: #b45309; font-size: 18px; font-weight: bold;">${setoranFormatted}</span></li>
              </ul>
            </div>

            <p>Silakan klik tombol di bawah ini untuk melakukan pembayaran cicilan Anda lewat website.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://tabunganhajiumrahku.com/dashboard/tabungan/${plan.id}/bayar" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Bayar Sekarang</a>
            </div>
          </div>
        `;

        await sendEmail({
          to: plan.jamaah.email,
          subject: `${judul} - ${monthString}`,
          html: emailHtml,
        });

        sentCount++;
      }
    }

    return NextResponse.json({ message: "Blast sukses", sentCount });
  } catch (error: any) {
    console.error("Blast Error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
