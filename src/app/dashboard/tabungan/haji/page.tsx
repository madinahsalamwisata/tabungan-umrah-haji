import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

export default async function TabunganHajiDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Coming Soon Card */}
      <div className="bg-white border border-garis rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-hijau-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-hijau-800" />
        </div>
        <h2 className="text-base font-bold text-teks-900 font-serif mb-2">Tabungan Haji Segera Hadir</h2>
        <p className="text-xs text-teks-500 leading-relaxed italic max-w-md">
          &quot;Semoga Allah Subhanahu Wa Ta&apos;ala memudahkan kami untuk segera menyelenggarakan program Haji dan memudahkan langkah jamaah kami untuk menunaikan ibadah Haji ke Baitullah. Amin Ya Rabbal &apos;Alamin.&quot;
        </p>
      </div>

      {/* Package Header */}
      <div className="pt-6 border-t border-garis/60">
        <div className="bg-gradient-to-br from-hijau-900 to-hijau-800 rounded-2xl px-4 py-3 mb-4 text-white shadow-sm inline-block">
          <h3 className="text-xs font-bold uppercase tracking-wider">Paket Estimasi Haji</h3>
        </div>
        <div className="bg-white border border-garis rounded-3xl p-8 text-center shadow-sm">
          <svg className="mx-auto h-10 w-10 text-teks-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-sm font-bold text-teks-900">Belum ada paket estimasi</h4>
          <p className="text-xs text-teks-500 mt-1">Saat ini belum ada paket estimasi Haji yang tersedia untuk ditampilkan.</p>
        </div>
      </div>
    </div>
  );
}
