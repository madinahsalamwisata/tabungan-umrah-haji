import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TabunganForm from "@/components/tabungan/TabunganForm";

export default async function TabunganBaruPage(props: {
  searchParams: Promise<{ paketId?: string, source?: string }>;
}) {
  const searchParams = await props.searchParams;
  const paketId = searchParams.paketId;
  const source = searchParams.source;

  if (!paketId) {
    return notFound();
  }

  const paket = await prisma.paket.findUnique({
    where: { id: paketId },
  });

  if (!paket) {
    return notFound();
  }

  // Calculate max months allowed based on departure date
  let maxBulan = 24;
  if (!paket.is_estimasi && paket.tanggal_keberangkatan) {
    const now = new Date();
    const depart = new Date(paket.tanggal_keberangkatan);
    const diffInMonths = (depart.getFullYear() - now.getFullYear()) * 12 + (depart.getMonth() - now.getMonth());
    maxBulan = Math.max(1, diffInMonths); // Could be very short if departing soon
  }

  // Convert Decimal and Date to string for Client Component serialization
  const serializedPaket = {
    id: paket.id,
    nama_paket: paket.is_estimasi || paket.nama_paket.includes("(Estimasi)") 
      ? paket.nama_paket.replace(/\s*\d{4}\s*H?\s*/i, ' ').replace(/\s+/g, ' ').trim() 
      : paket.nama_paket,
    tanggal_keberangkatan: paket.tanggal_keberangkatan ? new Date(paket.tanggal_keberangkatan).toISOString() : null,
    tanggal_kepulangan: paket.tanggal_kepulangan ? new Date(paket.tanggal_kepulangan).toISOString() : null,
    hotel_makkah: paket.hotel_makkah,
    hotel_madinah: paket.hotel_madinah,
    maskapai: paket.maskapai,
    harga_quad: paket.harga_quad.toString(),
    harga_triple: paket.harga_triple.toString(),
    harga_double: paket.harga_double.toString(),
    kuota: paket.kuota,
    deskripsi_fasilitas: paket.deskripsi_fasilitas,
    poster_url: paket.poster_url,
    is_estimasi: paket.is_estimasi,
  };

  let backUrl = "/dashboard/tabungan";
  let backText = "Kembali ke Tabungan";

  if (source === "paket") {
    backUrl = "/dashboard/paket";
    backText = "Kembali ke Pilihan Paket";
  } else if (source === "umrah") {
    backUrl = "/dashboard/tabungan/umrah";
    backText = "Kembali ke Tabungan Umrah";
  } else if (source === "haji") {
    backUrl = "/dashboard/tabungan/haji";
    backText = "Kembali ke Tabungan Haji";
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="hidden md:flex mb-4">
        <Link
          href={backUrl}
          className="flex items-center gap-1.5 text-xs font-bold text-hijau-700 hover:text-hijau-900 transition-colors bg-hijau-100/50 hover:bg-hijau-100 px-3.5 py-2 rounded-xl"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {backText}
        </Link>
      </div>
      <TabunganForm paket={serializedPaket} maxBulan={maxBulan} />
    </div>
  );
}
