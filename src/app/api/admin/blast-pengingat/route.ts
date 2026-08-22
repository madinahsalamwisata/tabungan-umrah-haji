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

      const startDate = new Date(plan.tanggal_mulai);
      let monthsElapsed = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth()) + 1;
      
      if (monthsElapsed <= 0) continue;

      // Target payments up to this month (max is the plan's periode_bulan)
      const targetPayments = Math.min(monthsElapsed, plan.periode_bulan);
      const paidCount = plan.RiwayatSetoran.filter(s => s.status_pembayaran === "Sukses").length;
      const unpaidCount = targetPayments - paidCount;

      if (unpaidCount > 0) {
        // Build the string of unpaid months
        const unpaidMonthNames = [];
        for (let i = 0; i < unpaidCount; i++) {
          const unpaidDate = new Date(startDate);
          unpaidDate.setMonth(startDate.getMonth() + paidCount + i);
          unpaidMonthNames.push(`${monthNames[unpaidDate.getMonth()]} ${unpaidDate.getFullYear()}`);
        }
        const unpaidMonthsString = unpaidMonthNames.join(", ");

        const totalNominal = unpaidCount * Number(plan.setoran_per_bulan);
        const setoranFormatted = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(totalNominal);
        
        let personalizedKonten = konten;
        personalizedKonten = personalizedKonten.replace(/\[Nama Jamaah\]/g, plan.jamaah.nama);
        personalizedKonten = personalizedKonten.replace(/\[Bulan\/Tahun\]/g, unpaidMonthsString);
        personalizedKonten = personalizedKonten.replace(/\[Bulan\]/g, unpaidMonthsString);
        personalizedKonten = personalizedKonten.replace(/\[Jumlah\]/g, setoranFormatted);

        // Convert simple markdown to HTML line breaks for email
        const formattedKonten = personalizedKonten.replace(/\n/g, '<br>');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f8fafc;">
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border-top: 4px solid #059669; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              ${formattedKonten}
              
              <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
                <a href="https://tabunganhajiumrahku.com/dashboard/tabungan/${plan.id}/bayar" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);">Bayar Sekarang</a>
              </div>
            </div>
          </div>
        `;

        await sendEmail({
          to: plan.jamaah.email,
          subject: `Pengingat Pembayaran Cicilan - ${monthString}`,
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
