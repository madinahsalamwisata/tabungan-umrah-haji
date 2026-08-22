import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "madinah_cron_2024";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthString = `${monthNames[currentMonth]} ${currentYear}`;

    // Get all active tabungan plans
    const activePlans = await prisma.rencanaTabungan.findMany({
      where: {
        status: "Aktif",
      },
      include: {
        jamaah: true,
        RiwayatSetoran: true,
        paket: true,
      },
    });

    let sentCount = 0;

    for (const plan of activePlans) {
      if (!plan.jamaah?.email) continue;

      // Check if there is any successful payment in the current month/year
      const hasPaidThisMonth = plan.RiwayatSetoran.some((setoran) => {
        const setoranDate = new Date(setoran.tanggal_setor);
        return (
          setoranDate.getMonth() === currentMonth &&
          setoranDate.getFullYear() === currentYear &&
          setoran.status_pembayaran === "Sukses"
        );
      });

      if (!hasPaidThisMonth) {
        const setoranFormatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(Number(plan.setoran_per_bulan));

        const paketName = plan.paket?.nama_paket || plan.paket_snapshot_nama || "Paket Umrah/Haji";

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #b45309; text-align: center;">Pengingat Tagihan Cicilan</h2>
            <p>Assalamu'alaikum Wr. Wb. Bapak/Ibu <strong>${plan.jamaah.nama}</strong>,</p>
            <p>Semoga Anda senantiasa dalam lindungan Allah SWT.</p>
            <p>Kami dari <strong>Madinah Salam Wisata</strong> ingin mengingatkan bahwa saat ini sudah memasuki tanggal 25, dan sistem kami mencatat bahwa Anda belum melakukan pembayaran cicilan tabungan untuk bulan <strong>${monthString}</strong>.</p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">Detail Tagihan Anda:</h3>
              <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 8px;"><strong>Paket:</strong> ${paketName}</li>
                <li style="margin-bottom: 8px;"><strong>Bulan Tagihan:</strong> ${monthString}</li>
                <li style="margin-bottom: 8px;"><strong>Jumlah yang harus dibayar:</strong> <span style="color: #b45309; font-size: 18px; font-weight: bold;">${setoranFormatted}</span></li>
              </ul>
            </div>

            <p>Mohon agar dapat segera melakukan pembayaran cicilan agar rencana keberangkatan Anda dapat berjalan lancar sesuai jadwal.</p>
            <p>Anda dapat melakukan pembayaran langsung melalui dashboard jamaah Anda.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://tabunganhajiumrahku.com/login" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Bayar Sekarang</a>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
              Jika Anda sudah melakukan pembayaran hari ini, silakan abaikan email ini. Apabila ada pertanyaan, silakan hubungi admin kami.
            </p>
          </div>
        `;

        await sendEmail({
          to: plan.jamaah.email,
          subject: `Pengingat Cicilan Tabungan ${monthString} - Madinah Salam Wisata`,
          html: emailHtml,
        });

        sentCount++;
      }
    }

    return NextResponse.json({
      message: "Cron job executed successfully",
      emailsSent: sentCount,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
