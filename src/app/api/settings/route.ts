import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_SECTIONS_TENTANG_KAMI = [
  {
    id: "visi",
    title: "Visi Kami",
    content: "Menjadi penyelenggara perjalanan ibadah Umrah, Haji, dan wisata terpercaya yang berkomitmen menghadirkan layanan sesuai tuntunan sunnah Rasulullah ﷺ."
  },
  {
    id: "misi",
    title: "Misi Kami",
    content: "Menyelenggarakan perjalanan ibadah Umrah dan Haji yang sesuai dengan tuntunan syariat dan sunnah.\nMemberikan pelayanan yang amanah, profesional, dan penuh kepedulian kepada jamaah.\nMembimbing jamaah secara ruhiyah dan teknis agar meraih ibadah yang sah, khusyuk, dan mabrur.\nMenghadirkan pengalaman berwisata yang edukatif, berkesan, dan memperkuat iman.\nMenjalin kemitraan yang transparan dan berkelanjutan dengan stakeholder lokal dan internasional.",
    isList: true
  }
];

const DEFAULT_SECTIONS_SYARAT_KETENTUAN = [
  {
    id: "pendaftaran",
    title: "Syarat & Ketentuan Pendaftaran",
    content: "Paspor minimal berlaku satu tahun dan nama minimal 2 suku kata.\nSoft copy KTP (PDF, PNG, atau JPG).\nSoft copy pas foto 4x6 (JPG atau PNG).\nSoft copy KK bagi anak di bawah umur. (PDF, PNG, atau JPG).\nSoft copy buku kuning vaksin/sertifikat vaksin meningitis dan polio asli (PDF, PNG, atau JPG).\nDP Rp6.000.000.\nPelunasan maksimal 1 bulan sebelum keberangkatan.",
    isList: true
  },
  {
    id: "pembatalan",
    title: "Syarat & Ketentuan Pembatalan",
    content: "A. Uang Muka (DP)\nDP yang telah diserahkan oleh calon jamaah umroh tidak bisa dikembalikan.\n\nB. Pelunasan\nCalon jamaah wajib melakukan pelunasan selambat-lambatnya H-30.\n\nC. Pembatalan\n- Pembatalan diatas 30 hari sebelum keberangkatan maka dikenakan pemotongan administrasi Rp 6.000.000.\n- Pembatalan 30 hari sebelum keberangkatan maka dikenakan pemotongan 50% dari harga paket.\n- Pembatalan 15 hari sebelum keberangkatan maka dikenakan pemotongan 100% dari harga paket.\n- Pembatalan otomatis: Apabila calon jamaah tidak melunasi H-25, maka dianggap mengundurkan diri."
  },
  {
    id: "ketentuan-khusus",
    title: "Ketentuan Khusus",
    content: "1. Klausul Force Majeure\nDalam hal terjadi keadaan kahar (force majeure) yang berada di luar kemampuan dan kendali Para Pihak, maka Pihak Travel dibebaskan dari segala tuntutan atas kerugian atau keterlambatan.\n\n2. Klausul Penyesuaian Harga\nPihak Travel berhak melakukan penyesuaian harga paket apabila terjadi kenaikan biaya dari pihak ketiga, seperti kenaikan harga tiket penerbangan maskapai."
  },
  {
    id: "alur-pembayaran",
    title: "Alur Pembayaran",
    content: "Pembayaran dapat dilakukan melalui transfer ke rekening resmi atau pembayaran di kantor secara langsung."
  },
  {
    id: "perlengkapan",
    title: "Perlengkapan yang Disediakan",
    content: "Koper, tas paspor, seragam batik, buku panduan, ID card, mukena (untuk wanita), dan kain ihram (untuk laki-laki)."
  }
];

const DEFAULT_SETTINGS: Record<string, string> = {
  tentang_kami_company_name: "PT Madinah Salam Wisata",
  tentang_kami_description: "Penyelenggara perjalanan ibadah Umrah dan Haji yang berfokus pada layanan yang amanah, profesional, dan sesuai dengan tuntunan syariat. Kami berkomitmen memberikan pengalaman ibadah terbaik bagi jamaah.",
  tentang_kami_ppiu_no: "03012400173490004",
  tentang_kami_sections: JSON.stringify(DEFAULT_SECTIONS_TENTANG_KAMI),
  syarat_ketentuan_sections: JSON.stringify(DEFAULT_SECTIONS_SYARAT_KETENTUAN)
};

export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // Update multiple settings keys in a transaction
    const updatePromises = Object.entries(body).map(([key, val]) => {
      if (typeof val !== "string") return Promise.resolve();
      return prisma.setting.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
